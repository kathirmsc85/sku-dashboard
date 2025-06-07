import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SKU, Note } from '../types';
import { skuAPI, notesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const SKUDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [sku, setSku] = useState<SKU | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSKUData();
    }
  }, [id]);

  // Auto-save functionality with debounce
  useEffect(() => {
    if (newNote && newNote.length > 0) {
      const timer = setTimeout(() => {
        if (newNote.trim()) {
          handleSaveNote();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [newNote]);

  const fetchSKUData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError('');
    
    try {
      const [skuData, notesData] = await Promise.all([
        skuAPI.getById(id),
        notesAPI.getBySKU(id)
      ]);
      
      setSku(skuData);
      setNotes(notesData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load SKU details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!id || !newNote.trim() || savingNote) return;
    
    setSavingNote(true);
    try {
      const note = await notesAPI.create({
        sku_id: id,
        content: newNote.trim()
      });
      
      setNotes([...notes, note]);
      setNewNote('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    
    try {
      const updatedNote = await notesAPI.update(noteId, editContent.trim());
      setNotes(notes.map(note => note.id === noteId ? updatedNote : note));
      setEditingNote(null);
      setEditContent('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await notesAPI.delete(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete note');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getReturnBadge = (percentage: number) => {
    if (percentage > 10) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <TrendingUp className="h-4 w-4 mr-1" />
          High ({percentage}%)
        </span>
      );
    } else if (percentage > 5) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
          {percentage}%
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <TrendingDown className="h-4 w-4 mr-1" />
          Low ({percentage}%)
        </span>
      );
    }
  };

  const getContentScoreBadge = (score: number) => {
    const stars = Math.round(score);
    const color = score >= 8 ? 'text-green-500' : score >= 6 ? 'text-yellow-500' : 'text-red-500';
    
    return (
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold">{score.toFixed(1)}</span>
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < stars ? color : 'text-gray-300'} ${i < stars ? 'fill-current' : ''}`}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !sku) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading SKU</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">{sku?.name}</h1>
          <p className="text-gray-600 mt-1">SKU ID: {sku?.id}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {formatCurrency(sku?.sales || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Sales</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getReturnBadge(sku?.return_percentage || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Return Rate</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {getContentScoreBadge(sku?.content_score || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Content Score</div>
                </div>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sales Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sku?.sales_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Sales']} />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Sales Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Sales Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sku?.sales_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Sales']} />
                    <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Notes Sidebar */}
          <div className="space-y-6">
            {/* Add New Note */}
            {user?.role === 'brand_user' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
                <div className="space-y-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a follow-up note..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {savingNote ? 'Auto-saving...' : 'Auto-saves 2 seconds after you stop typing'}
                    </p>
                    <button
                      onClick={handleSaveNote}
                      disabled={!newNote.trim() || savingNote}
                      className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notes List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Notes ({notes.length})</h3>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No notes yet.</p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      {editingNote === note.id ? (
                        <div className="space-y-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditNote(note.id)}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                              <Save className="h-3 w-3" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingNote(null);
                                setEditContent('');
                              }}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                            >
                              <X className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-900 mb-3">{note.content}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {new Date(note.created_at).toLocaleDateString()} at{' '}
                              {new Date(note.created_at).toLocaleTimeString()}
                            </span>
                            {(user?.role === 'brand_user') && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingNote(note.id);
                                    setEditContent(note.content);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SKUDetail;