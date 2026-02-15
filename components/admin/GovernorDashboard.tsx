import React, { useState, useEffect } from 'react';
import { User, SpecificRole, Department, DocumentType } from '../../types';
import { supabase } from '../../services/supabaseClient';
import { Users, FileText, Upload, Trash2, Check, X, Shield, Plus, LogOut, Settings, Database, Archive, Home } from 'lucide-react';

interface GovernorDashboardProps {
    user: User;
    onNavigate: (view: string) => void;
    onLogout: () => void;
}

export const GovernorDashboard: React.FC<GovernorDashboardProps> = ({ user, onNavigate, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'officers' | 'knowledge' | 'archives'>('officers');
    const [officers, setOfficers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Knowledge Base State
    const [templates, setTemplates] = useState<any[]>([]);
    const [datasets, setDatasets] = useState<any[]>([]);

    // Approval Modal
    const [selectedOfficer, setSelectedOfficer] = useState<User | null>(null);
    const [assignRole, setAssignRole] = useState<string>('Vice Governor');
    const [customRole, setCustomRole] = useState('');
    const [permissions, setPermissions] = useState({
        official_letter: false,
        activity_proposal: false,
        constitution: false
    });

    useEffect(() => {
        fetchData();
    }, [user.department]);

    const fetchData = async () => {
        if (!user.department) return;
        setLoading(true);
        try {
            // Fetch Officers
            const { data: officerData, error: offError } = await supabase
                .from('user_roles')
                .select(`*, profiles:user_id (full_name, email, avatar_url)`)
                .eq('department', user.department)
                .eq('role', 'officer')
                .neq('status', 'disabled') // Don't show old term officers
                .order('created_at', { ascending: false });

            if (offError) throw offError;

            const mapUser = (r: any) => ({
                id: r.user_id,
                email: r.profiles?.email,
                full_name: r.profiles?.full_name,
                role_id: r.id,
                user_type: r.role,
                specific_role: r.specific_role,
                department: r.department,
                status: r.status,
                permissions: r.permissions
            });
            setOfficers(officerData?.map(mapUser) || []);

            // Fetch Templates
            const { data: tmplData } = await supabase
                .from('department_templates')
                .select('*')
                .eq('department', user.department);
            setTemplates(tmplData || []);

            // Fetch Datasets
            const { data: dsData } = await supabase
                .from('department_datasets')
                .select('*')
                .eq('department', user.department);
            setDatasets(dsData || []);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveOfficer = async () => {
        if (!selectedOfficer) return;
        const finalRole = assignRole === 'Other' ? customRole : assignRole;

        // Construct permissions object
        const finalPermissions = {
            official_letter: permissions.official_letter ? 'edit' : 'view',
            activity_proposal: permissions.activity_proposal ? 'edit' : 'view',
            constitution: permissions.constitution ? 'edit' : 'view'
        };

        try {
            const { error } = await supabase.from('user_roles').update({
                status: 'active',
                specific_role: finalRole,
                permissions: finalPermissions,
                managed_by_role_id: user.role_id // Link to this governor instance
            }).eq('id', selectedOfficer.role_id);

            if (error) throw error;
            setSelectedOfficer(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditOfficer = (officer: User) => {
        setSelectedOfficer(officer);

        // Set role
        if (['Vice Governor', 'Secretary', 'Treasurer', 'Auditor', 'P.I.O', 'Business Manager', 'Sgt. at Arms'].includes(officer.specific_role || '')) {
            setAssignRole(officer.specific_role || 'Vice Governor');
            setCustomRole('');
        } else {
            setAssignRole('Other');
            setCustomRole(officer.specific_role || '');
        }

        // Set permissions
        setPermissions({
            official_letter: officer.permissions?.official_letter === 'edit',
            activity_proposal: officer.permissions?.activity_proposal === 'edit',
            constitution: officer.permissions?.constitution === 'edit'
        });
    };

    const handleUploadTemplate = async (type: DocumentType, content: string) => {
        // Simplified: Just upsert text content for now
        // In real app, this would be a file upload or editor
        try {
            const { error } = await supabase.from('department_templates').upsert({
                department: user.department,
                document_type: type,
                content: content,
                updated_by: user.id
            }, { onConflict: 'department, document_type' });
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleUploadDataset = async (type: DocumentType, url: string, desc: string) => {
        try {
            const { error } = await supabase.from('department_datasets').insert({
                department: user.department,
                document_type: type,
                file_url: url,
                description: desc,
                uploaded_by: user.id
            });
            if (error) throw error;
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white flex flex-col fixed h-full z-10">
                <div className="p-6">
                    <h1 className="text-2xl font-serif italic">SmartDraft</h1>
                    <p className="text-blue-200 text-sm">{user.department} Admin</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-blue-200 hover:bg-white/5 mb-2"
                    >
                        <Home className="w-5 h-5" />
                        Back to Workspace
                    </button>
                    <div className="h-px bg-blue-800 my-2 mx-4"></div>
                    <button
                        onClick={() => setActiveTab('officers')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'officers' ? 'bg-white/10 text-white' : 'text-blue-200 hover:bg-white/5'}`}
                    >
                        <Users className="w-5 h-5" />
                        Officers
                    </button>
                    <button
                        onClick={() => setActiveTab('knowledge')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'knowledge' ? 'bg-white/10 text-white' : 'text-blue-200 hover:bg-white/5'}`}
                    >
                        <Database className="w-5 h-5" />
                        Knowledge Base
                    </button>

                </nav>

                <div className="p-4 border-t border-blue-800">
                    <div className="mb-4 px-4">
                        <p className="text-sm font-bold">{user.full_name}</p>
                        <p className="text-xs text-blue-300">{user.specific_role}</p>
                    </div>
                    <button onClick={onLogout} className="flex items-center gap-2 text-blue-200 hover:text-white transition w-full px-4">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-64 p-8">
                {activeTab === 'officers' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{user.department} Officers</h2>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {officers.map(officer => (
                                <div key={officer.role_id} className="p-4 border-b border-gray-100 flex items-center justify-between last:border-0 hover:bg-gray-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                                            {officer.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{officer.full_name}</h4>
                                            <p className="text-sm text-gray-500">{officer.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${officer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {officer.status}
                                                </span>
                                                {officer.specific_role && <span className="text-xs text-blue-600 font-medium">{officer.specific_role}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {officer.status === 'pending' && (
                                        <button
                                            onClick={() => setSelectedOfficer(officer)}
                                            className="px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
                                        >
                                            Review Request
                                        </button>
                                    )}

                                    {officer.status === 'active' && (
                                        <button
                                            onClick={() => handleEditOfficer(officer)}
                                            className="p-2 text-gray-400 hover:text-gray-600"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {officers.length === 0 && <div className="p-8 text-center text-gray-500">No officers found.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'knowledge' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{user.department} Resources</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Templates Section */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" /> Templates
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Upload ONE standard template per document type.</p>

                                <div className="space-y-4">
                                    {[DocumentType.ACTIVITY_PROPOSAL, DocumentType.OFFICIAL_LETTER, DocumentType.CONSTITUTION].map(type => {
                                        const exists = templates.find(t => t.document_type === type);
                                        return (
                                            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${exists ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">{type}</p>
                                                        <p className="text-xs text-gray-500">{exists ? 'Uploaded' : 'Missing'}</p>
                                                    </div>
                                                </div>
                                                <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded shadow-sm hover:bg-gray-50">
                                                    {exists ? 'Replace' : 'Upload'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Datasets Section */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-purple-600" /> Datasets
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Upload multiple reference files for AI context.</p>

                                <button className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-400 hover:border-blue-500 hover:text-blue-500 transition mb-6 flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8" />
                                    <span className="text-sm font-medium">Upload PDF or Text File</span>
                                </button>

                                <div className="space-y-2">
                                    {datasets.map(ds => (
                                        <div key={ds.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700 truncate">{ds.description || 'Dataset'}</span>
                                            </div>
                                            <button className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Approval Modal */}
            {selectedOfficer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">
                            {selectedOfficer.status === 'pending' ? 'Approve Officer' : 'Edit Officer Access'}
                        </h3>
                        <p className="text-gray-600 mb-6">Assign role and permissions for <strong>{selectedOfficer.full_name}</strong>.</p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={assignRole}
                                    onChange={(e) => setAssignRole(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-900"
                                >
                                    <option>Vice Governor</option>
                                    <option>Secretary</option>
                                    <option>Treasurer</option>
                                    <option>Auditor</option>
                                    <option>P.I.O</option>
                                    <option>Business Manager</option>
                                    <option>Sgt. at Arms</option>
                                    <option>Other</option>
                                </select>
                                {assignRole === 'Other' && (
                                    <input
                                        type="text"
                                        placeholder="Enter Role Name"
                                        value={customRole}
                                        onChange={(e) => setCustomRole(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg p-2.5 mt-2 outline-none focus:ring-2 focus:ring-blue-900"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Edit Access</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.official_letter}
                                            onChange={(e) => setPermissions({ ...permissions, official_letter: e.target.checked })}
                                            className="rounded text-blue-900 focus:ring-blue-900"
                                        />
                                        <span className="text-sm text-gray-700">Official Letter</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.activity_proposal}
                                            onChange={(e) => setPermissions({ ...permissions, activity_proposal: e.target.checked })}
                                            className="rounded text-blue-900 focus:ring-blue-900"
                                        />
                                        <span className="text-sm text-gray-700">Activity Proposal</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={permissions.constitution}
                                            onChange={(e) => setPermissions({ ...permissions, constitution: e.target.checked })}
                                            className="rounded text-blue-900 focus:ring-blue-900"
                                        />
                                        <span className="text-sm text-gray-700">Constitution & By-Laws</span>
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">* Unchecked items will be View Only.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setSelectedOfficer(null)} className="flex-1 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button
                                onClick={handleApproveOfficer}
                                className="flex-1 bg-blue-900 text-white py-2.5 rounded-lg hover:bg-blue-800 font-medium"
                            >
                                {selectedOfficer.status === 'pending' ? 'Confirm Approval' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
