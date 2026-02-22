import { GoogleGenAI, GenerateContentResponse, Chat, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { DocumentType } from "../types";
import { supabase } from "./supabaseClient";

class GeminiService {
    private ai: GoogleGenAI | null = null;
    private apiKey: string = '';

    constructor() {
        this.apiKey = this.getApiKey();
        if (this.apiKey) {
            this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        }
    }

    private getApiKey(): string {
        let key = '';
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            if (import.meta.env.VITE_GEMINI_API_KEY) key = import.meta.env.VITE_GEMINI_API_KEY;
            // @ts-ignore
            else if (import.meta.env.GEMINI_API_KEY) key = import.meta.env.GEMINI_API_KEY;
        }

        if (!key) {
            console.error("Gemini API Key is missing! Please set VITE_GEMINI_API_KEY in .env");
        }
        return key;
    }

    private getAI(): GoogleGenAI {
        if (!this.ai) {
            this.apiKey = this.getApiKey();
            if (!this.apiKey) throw new Error("API Key missing.");
            this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        }
        return this.ai;
    }

    // Helper to get AI Configuration from LocalStorage
    private getAISettings() {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('nemsu_ai_settings');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    console.error("Failed to parse AI settings", e);
                }
            }
        }
        return { tone: 'Formal', length: 'Standard' };
    }

    private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        try {
            return await fn();
        } catch (error: any) {
            if (retries > 0 && (error?.status === 429 || error?.message?.includes('429'))) {
                console.warn(`Gemini API rate limited (429). Retrying in ${delay}ms... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.withRetry(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        return this.withRetry(async () => {
            const ai = this.getAI();
            const result = await ai.models.embedContent({
                model: "gemini-embedding-001", // Reverting to a more standard embedding model
                contents: [{
                    parts: [{ text: text }]
                }],
            });

            // The new SDK (v1.x) might return result.embeddings[0] or result.embedding
            // @ts-ignore
            const embedding = result.embedding || (result.embeddings && result.embeddings[0]);

            if (!embedding || !embedding.values) {
                console.error("Unexpected Embedding Result Structure:", JSON.stringify(result));
                throw new Error("Failed to extract embedding values from response.");
            }

            return embedding.values;
        });
    }

    public async searchSimilarDatasets(
        department: string,
        query: string,
        documentType: DocumentType,
        limit = 3
    ) {
        try {
            const embedding = await this.generateEmbedding(query);

            const { data, error } = await supabase.rpc('match_datasets', {
                query_embedding: embedding,
                match_threshold: 0.5,
                match_count: limit,
                filter_department: department,
                filter_type: documentType
            });

            if (error) {
                console.error("Vector Search Error:", error);
                const { data: fallbackData } = await supabase
                    .from('department_datasets')
                    .select('file_content, detailed_context')
                    .eq('department', department)
                    .eq('document_type', documentType)
                    .limit(limit);

                return fallbackData?.map(d => ({
                    ...d,
                    content: d.file_content
                })) || [];
            }

            return data;
        } catch (err) {
            console.error("Search Error:", err);
            return [];
        }
    }

    public async generateDocument(
        type: DocumentType,
        formData: Record<string, any>,
        userDepartment?: string
    ): Promise<string> {
        const ai = this.getAI();
        const aiSettings = this.getAISettings();

        const systemInstruction = `You are an expert academic administrator. Output Office Open XML (OOXML) format only, representing the inner content of a <w:body> tag for a Word document.

        CRITICAL INSTRUCTION:
        1. Output ONLY valid WordprocessingML (OOXML) elements (e.g., <w:p>, <w:tbl>, <w:r>, <w:t>, etc.).
        2. DO NOT include the <w:document> or root <w:body> wrapper tags, output only the inner child elements.
        3. DO NOT output HTML or Markdown. DO NOT wrap the output in any markdown code blocks (like \`\`\`xml).
        4. Review the REFERENCE MATERIAL (if any provided in the prompt). 
        5. Identify the document from the reference that is most relevant to the user request.
        6. Use the content and structure of that selected document as your primary guide/template.

        STRUCTURAL MANDATES:
        - **Signatories**: If the document is an "Activity Proposal" or similar, you MUST append a "Signatories" section at the bottom.
          - Format this using OOXML tables (<w:tbl>) with invisible borders (<w:tcBorders> with val="nil" inside <w:tblBorders>) to ensure proper alignment.
          - **Left Align**: "Prepared by" (Proponent)
          - **Center/Right Align**: "Noted by" (Adviser, Chair), "Recommending Approval" (Dean), "Approved" (Campus Director/Chancellor).
          - Do NOT list them in a single vertical column; mimic the wide layout of official documents.
        `;

        let searchContext = "";
        // TWO-STEP RAG: Step 1 - Analyze intent to get an optimized search query
        try {
            const analysisPrompt = `Analyze this document request and provide a single, keyword-rich search query to find relevant reference materials in a database.
            Document Type: ${type}
            Details: ${JSON.stringify(formData)}
            
            Output ONLY the search query string. No other text.`;

            const analysisResult = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [{ role: "user", parts: [{ text: analysisPrompt }] }]
            });
            // @ts-ignore
            searchContext = analysisResult.text?.trim() || analysisResult.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            console.log("Extracted Search Query:", searchContext);
        } catch (e) {
            console.warn("Failed to extract search context, falling back to basic metadata.", e);
            searchContext = `${type} ${formData.title || formData.subject || ''}`;
        }

        let prompt = "";
        const styleInstruction = `
        STYLE & TONE INSTRUCTIONS:
        - **Tone**: ${aiSettings.tone} (Ensure the language reflects this tone).
        - **Length/Verbosity**: ${aiSettings.length} (Adjust paragraph length and detail accordingly).
        `;

        switch (type) {
            case DocumentType.ACTIVITY_PROPOSAL:
                searchContext = `Activity Proposal for ${formData.title || 'General Event'}`;
                prompt = `
                Please generate an ACTIVITY PROPOSAL using the provided details:
                ${JSON.stringify(formData, null, 2)}

                IMPORTANT:
                - Look at the REFERENCE MATERIAL provided below.
                - If you find an "Activity Proposal" or similar document there, CLONE its structure, headers, and style exactly.
                - If no reference is found, use a standard professional format.
                - FILL in the content with the formData variables.
                `;
                break;
            case DocumentType.OFFICIAL_LETTER:
                searchContext = `Official Letter regarding ${formData.subject || 'General Topic'}`;
                prompt = `Write the BODY of a formal official letter.
                DO NOT include the University Header, Logo, or Address at the top.
                
                From: ${formData.senderName} (${formData.senderPosition})
                To: ${formData.recipientName}
                Subject: ${formData.subject}
                Details: ${formData.details}
                
                Return pure OOXML format. Start with the Date, then the Recipient Block, then the Salutation. Use proper <w:p> for paragraphs.`;
                break;
            default:
                searchContext = `${type} document details`;
                prompt = `Generate the body content for a document of type ${type} with details: ${JSON.stringify(formData)}. Return in pure OOXML format. Do not include letterhead/logos.`;
        }

        let referenceMaterial = "";
        if (userDepartment) {
            // 1. Fetch Similar Datasets
            const similarDatasets = await this.searchSimilarDatasets(userDepartment, searchContext, type);
            if (similarDatasets && similarDatasets.length > 0) {
                referenceMaterial += similarDatasets.map((d: any) => `
                --- SIMILAR DATABASE DOCUMENT ---
                CONTEXT: ${d.detailed_context || 'No specific context'}
                CONTENT:
                ${d.file_content || d.content || ''}
                --------------------------
                `).join('\n\n');
            }

            // 2. Fetch Blank Template Content (always include as base structural reference)
            const { data: tmplData } = await supabase
                .from('department_templates')
                .select('content')
                .eq('department', userDepartment)
                .eq('document_type', type)
                .limit(1);

            if (tmplData && tmplData.length > 0 && tmplData[0].content) {
                referenceMaterial += `
                --- UPLOADED TEMPLATE ---
                CONTENT:
                ${tmplData[0].content}
                --------------------------
                `;
            }
        }

        const fullPrompt = `
        ${prompt}

        ${styleInstruction}

        REFERENCE MATERIAL:
        ${referenceMaterial || "No specific reference material found. Use standard templates."}
        `;

        return this.withRetry(async () => {
            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{
                        role: "user",
                        parts: [{ text: fullPrompt }]
                    }],
                    config: {
                        systemInstruction: systemInstruction,
                    }
                });

                // @ts-ignore
                return response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || "";
            } catch (error) {
                console.error("AI Generation Error Detailed:", error);
                throw new Error(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        });
    }

    public async generateDatasetContext(content: string): Promise<string> {
        return this.withRetry(async () => {
            const ai = this.getAI();
            const prompt = `
            Analyze the following document content and provide a detailed, keyword-rich description suitable for Retrieval Augmented Generation (RAG).
            
            Focus on:
            1. Document Type (e.g., Activity Proposal, Constitution)
            2. Main Subject/Title
            3. Key Entities (Signatories, Departments)
            4. Purpose of the document
            
            Keep it concise but comprehensive (max 1 paragraph).
            
            DOCUMENT CONTENT (Truncated):
            ${content.substring(0, 15000)} 
            `;

            try {
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{
                        role: "user",
                        parts: [{ text: prompt }]
                    }]
                });
                // @ts-ignore
                return response.text || "";
            } catch (error) {
                console.error("Context Generation Error:", error);
                return "Auto-generated context failed. Content snippet: " + content.substring(0, 100) + "...";
            }
        });
    }
}

export const geminiService = new GeminiService();

// Export standalone functions for backward compatibility if needed, 
// using the singleton instance.
export const generateEmbedding = (text: string) => geminiService.generateEmbedding(text);
export const generateDocument = (type: DocumentType, formData: Record<string, any>, userDepartment?: string) => geminiService.generateDocument(type, formData, userDepartment);
export const generateDatasetContext = (content: string) => geminiService.generateDatasetContext(content);

const documentTool: FunctionDeclaration = {
    name: 'submit_document_details',
    description: 'Submits the gathered document details to the application. Call this ONLY when all necessary details have been collected.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            gatheredData: {
                type: Type.OBJECT,
                description: 'A flat JSON object containing the gathered form fields as key-value pairs. Use concise, descriptive keys (e.g., {"title": "...", "venue": "..."}).',
            },
        },
        required: ['gatheredData'],
    },
};

export class LiveSession {
    public isConnected = false;
    public inputContext: AudioContext | null = null;
    public outputContext: AudioContext | null = null;
    public inputAnalyser: AnalyserNode | null = null;
    public outputAnalyser: AnalyserNode | null = null;

    private sessionPromise: Promise<any> | null = null;
    private stream: MediaStream | null = null;
    private processor: ScriptProcessorNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private nextStartTime = 0;
    private audioSourceNodes = new Set<AudioBufferSourceNode>();
    private onDocumentGenerated: (gatheredData: Record<string, any>) => void;
    private department?: string;
    private documentType?: DocumentType;

    // VAD (Voice Activity Detection) State
    private isSpeaking = false;
    private silenceStart = 0;
    private readonly SILENCE_THRESHOLD_MS = 1500;
    private readonly DB_THRESHOLD = -45; // Adjust if mic is too sensitive/quiet

    // Graceful Disconnect State
    private pendingToolData: Record<string, any> | null = null;
    private finalizeTimeout: NodeJS.Timeout | null = null;

    private triggerFinalization() {
        if (this.finalizeTimeout) clearTimeout(this.finalizeTimeout);
        this.finalizeTimeout = setTimeout(() => {
            if (this.audioSourceNodes.size === 0 && this.pendingToolData) {
                const data = this.pendingToolData;
                this.pendingToolData = null;
                console.log("LiveSession: Final audio completed. Proceeding to generation UI callback.");
                this.onDocumentGenerated(data);
            }
        }, 1500); // Give 1.5s grace period for trailing chunks
    }

    constructor(onDocumentGenerated: (gatheredData: Record<string, any>) => void, department?: string, documentType?: DocumentType) {
        this.onDocumentGenerated = onDocumentGenerated;
        this.department = department;
        this.documentType = documentType;
    }

    async connect() {
        if (this.isConnected) return;

        // 1. Get User Media FIRST to ensure permission and device existence
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Voice features require a secure context (HTTPS) and microphone access.");
        }

        try {
            console.log("LiveSession: Requesting microphone access...");
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            console.error("Microphone access failed:", e);
            throw new Error("Microphone not found or permission denied. Please allow microphone access.");
        }

        // Fetch Reference Material for RAG BEFORE connecting
        let referenceContent = "";
        if (this.department && this.documentType) {
            console.log("Fetching reference templates for Voice Agent...");
            try {
                // 1. Fetch Similar Datasets
                const searchResults = await geminiService.searchSimilarDatasets(this.department, `${this.documentType} template`, this.documentType, 3);
                if (searchResults && searchResults.length > 0) {
                    referenceContent += searchResults.map((d: any) => `
--- SIMILAR DATABASE DOCUMENT ---
CONTEXT: ${d.detailed_context}
CONTENT:
${d.file_content || d.content}
--------------------------
`).join("\n\n");
                }

                // 2. Fetch Blank Template Content
                const { data: tmplData } = await supabase
                    .from('department_templates')
                    .select('content')
                    .eq('department', this.department)
                    .eq('document_type', this.documentType)
                    .limit(1);

                if (tmplData && tmplData.length > 0 && tmplData[0].content) {
                    referenceContent += `
--- UPLOADED TEMPLATE ---
CONTENT:
${tmplData[0].content}
--------------------------
`;
                }

                console.log("Successfully fetched dual-reference content for Voice Agent.");
            } catch (e) {
                console.warn("Failed to fetch RAG context for voice session:", e);
            }
        }

        // 2. Initialize AudioContexts only after permissions are granted
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

        // Input: Force 16kHz sample rate as required by Gemini Live
        this.inputContext = new AudioContextClass({ sampleRate: 16000 });
        this.outputContext = new AudioContextClass(); // Playback rate

        this.inputAnalyser = this.inputContext.createAnalyser();
        this.inputAnalyser.fftSize = 256;
        this.outputAnalyser = this.outputContext.createAnalyser();
        this.outputAnalyser.fftSize = 256;

        if (this.outputContext.state === 'suspended') {
            await this.outputContext.resume();
        }

        // Determine required fields based on document type
        let requiredFields = "the necessary details";
        let expectedKeys = "";

        if (this.documentType === DocumentType.ACTIVITY_PROPOSAL) {
            requiredFields = `
1. Name of Organization/Proponent
2. Activity Title
3. Venue 
4. Date
5. Specific Objectives
6. Estimated Budget
7. Source of Funds`;
            expectedKeys = `JSON keys to use: "orgName", "title", "venue", "date", "objectives", "budget", "source"`;
        } else if (this.documentType === DocumentType.OFFICIAL_LETTER) {
            requiredFields = `
1. From (Sender Name and Position)
2. To (Recipient Name and Position)
3. Subject
4. Key details to include in the body`;
            expectedKeys = `JSON keys to use: "senderName", "senderPosition", "recipientName", "subject", "details"`;
        }

        const systemInstructionText = `You are the Voice Agent for NEMSU SmartDraft (Identity: Gemini Pulse). 
You help academic users draft formal documents (like ${this.documentType || 'general documents'}).

CRITICAL INITIALIZATION: YOU MUST SPEAK FIRST. Greet the user and identify the document they are trying to create.

YOUR MISSION:
You are a conversational data gatherer. Your job is to extract the following information interactively from the user, one or two questions at a time:
${requiredFields}

Once you have gathered all details, say "Great, I have all the details. Generating your document now." and IMMEDIATELY call the 'submit_document_details' tool.

TOOL INSTRUCTIONS:
Pass the gathered information into the 'gatheredData' parameter as a JSON object.
Ensure you use the correct keys for the data to match the UI form.
${expectedKeys}

Do NOT generate the document content yourself. Just pass the raw facts into the JSON and the main application pipeline will generate the OOXML safely.`;

        console.log("LiveSession: Connecting to Gemini WebSockets...");
        const ai = geminiService['getAI']();

        const config = {
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => console.log("WebSocket Connection opened"),
                onmessage: this.onMessage.bind(this),
                onclose: () => console.log('WebSocket Session closed'),
                onerror: (e: any) => console.error('WebSocket Session error', e),
            },
            config: {
                generationConfig: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                },
                systemInstruction: {
                    parts: [{ text: systemInstructionText }],
                },
                tools: [{ functionDeclarations: [documentTool] }],
            },
        };

        try {
            // @ts-ignore
            this.sessionPromise = ai.live.connect(config);
            const session = await this.sessionPromise;

            this.isConnected = true;
            this.startAudioInput();
            console.log("Voice Agent WebSockets connected successfully.");

            // TRIGGER: Send a silent audio frame to wake it up
            try {
                const silentFrame = new Float32Array(512).fill(0);
                const blob = this.createBlob(silentFrame);
                session.sendRealtimeInput({ media: blob });
            } catch (e) {
                console.warn("Failed to send wake-up frame", e);
            }
        } catch (e) {
            console.error("LiveSession WebSocket connection failed:", e);
            this.disconnect();
            throw e;
        }
    }

    private startAudioInput() {
        if (!this.inputContext || !this.stream) return;

        this.source = this.inputContext.createMediaStreamSource(this.stream);
        this.source.connect(this.inputAnalyser!);

        // ScriptProcessor is deprecated but widely supported for raw PCM access
        this.processor = this.inputContext.createScriptProcessor(4096, 1, 1);

        this.processor.onaudioprocess = (e) => {
            if (!this.isConnected) return;
            const inputData = e.inputBuffer.getChannelData(0);

            // --- VAD (Voice Activity Detection) Logic ---
            let sumSquares = 0;
            for (let i = 0; i < inputData.length; i++) {
                sumSquares += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sumSquares / inputData.length);
            const decibels = 20 * Math.log10(rms || 0.00001);

            if (decibels > this.DB_THRESHOLD) {
                // User is currently speaking
                this.isSpeaking = true;
                this.silenceStart = 0;
            } else if (this.isSpeaking) {
                // User was speaking, now silent
                if (this.silenceStart === 0) {
                    this.silenceStart = Date.now();
                } else if (Date.now() - this.silenceStart > this.SILENCE_THRESHOLD_MS) {
                    // Silence threshold reached
                    this.isSpeaking = false;
                    this.silenceStart = 0;

                    // Fire exact turnComplete payload expected by Gemini Live API
                    if (this.sessionPromise && this.isConnected) {
                        this.sessionPromise.then((session: any) => {
                            try {
                                session.send({ clientContent: { turnComplete: true } });
                                console.log("LiveSession VAD: 1.5s silence detected, emitting turnComplete.");
                            } catch (err) { }
                        }).catch(() => { });
                    }
                }
            }
            // -------------------------------------------

            const pcmBlob = this.createBlob(inputData);

            if (this.sessionPromise && this.isConnected) {
                this.sessionPromise.then((session: any) => {
                    if (!this.isConnected) return;
                    try {
                        session.sendRealtimeInput({ media: pcmBlob });
                    } catch (err) {
                        // Ignore transient send errors globally during disconnect
                    }
                }).catch(() => { });
            }
        };

        this.source.connect(this.processor);
        this.processor.connect(this.inputContext.destination);
    }

    private async onMessage(message: LiveServerMessage) {
        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
            this.audioSourceNodes.forEach(node => {
                try { node.stop(); } catch (e) { }
            });
            this.audioSourceNodes.clear();
            this.nextStartTime = 0;
            return;
        }

        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            await this.playAudio(audioData);
        }

        const toolCall = message.toolCall;
        if (toolCall) {
            for (const call of toolCall.functionCalls) {
                if (call.name === 'submit_document_details') {
                    console.log("Tool invoked: submit_document_details", call.args);
                    const gatheredData = (call.args as any).gatheredData;

                    // Respond to tool call FIRST to prevent blocking / closed socket errors
                    if (this.sessionPromise && this.isConnected) {
                        try {
                            const session = await this.sessionPromise;
                            session.sendToolResponse({
                                functionResponses: {
                                    id: call.id,
                                    name: call.name,
                                    response: { result: 'Data submitted successfully. Generating document.' }
                                }
                            });
                        } catch (e) {
                            console.warn("Could not send tool response:", e);
                        }
                    }

                    // Queue the finalization to await audio completion instead of instant UI disconnect
                    if (gatheredData) {
                        this.pendingToolData = gatheredData;
                        this.triggerFinalization();
                    } else {
                        console.warn("Tool called but gatheredData is missing.");
                    }
                }
            }
        }
    }

    private createBlob(data: Float32Array) {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            const val = Math.max(-1, Math.min(1, data[i]));
            int16[i] = val * 32768;
        }

        let binary = '';
        const bytes = new Uint8Array(int16.buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        return {
            data: base64,
            mimeType: 'audio/pcm;rate=16000'
        };
    }

    private async playAudio(base64: string) {
        if (!this.outputContext || !this.outputAnalyser) return;

        if (this.outputContext.state === 'suspended') {
            await this.outputContext.resume();
        }

        try {
            const binaryString = atob(base64);
            const len = binaryString.length;
            let bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            if (bytes.length % 2 !== 0) {
                const newBytes = new Uint8Array(bytes.length + 1);
                newBytes.set(bytes);
                bytes = newBytes;
            }

            const dataInt16 = new Int16Array(bytes.buffer);
            // Gemini native output rate is 24000
            const buffer = this.outputContext.createBuffer(1, dataInt16.length, 24000);
            const channelData = buffer.getChannelData(0);
            for (let i = 0; i < dataInt16.length; i++) {
                channelData[i] = dataInt16[i] / 32768.0;
            }

            this.nextStartTime = Math.max(this.nextStartTime, this.outputContext.currentTime);
            const source = this.outputContext.createBufferSource();
            source.buffer = buffer;

            source.connect(this.outputAnalyser);
            this.outputAnalyser.connect(this.outputContext.destination);

            source.onended = () => {
                this.audioSourceNodes.delete(source);
                if (this.pendingToolData) {
                    this.triggerFinalization();
                }
            };
            this.audioSourceNodes.add(source);

            source.start(this.nextStartTime);
            this.nextStartTime += buffer.duration;
        } catch (e) {
            console.error("Error playing audio chunk", e);
        }
    }

    disconnect() {
        console.log("LiveSession: Disconnecting...");
        this.isConnected = false;

        if (this.sessionPromise) {
            this.sessionPromise.then((session: any) => {
                try {
                    session.close();
                } catch (e) {
                    console.warn("Error closing session:", e);
                }
            }).catch(() => { });
            this.sessionPromise = null;
        }

        try {
            if (this.processor) {
                this.processor.onaudioprocess = null;
                this.processor.disconnect();
            }
        } catch (e) { }
        this.source?.disconnect();
        this.stream?.getTracks().forEach(t => t.stop());

        if (this.inputContext && this.inputContext.state !== 'closed') {
            this.inputContext.close().catch(e => console.warn(e));
        }
        if (this.outputContext && this.outputContext.state !== 'closed') {
            this.outputContext.close().catch(e => console.warn(e));
        }

        this.audioSourceNodes.forEach(node => {
            try { node.stop(); } catch (e) { }
        });
        this.audioSourceNodes.clear();
    }
}
