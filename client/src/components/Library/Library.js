import React, { useState, useEffect } from 'react';
import 'nes.css/css/nes.min.css';
import '../rpgui.css';
import '../styles/animations.css';
import './library.css';
import { FaUserAlt } from 'react-icons/fa';
import { FcPieChart } from 'react-icons/fc';
// import {useApplicationData} from '../hooks/useApplicationData.js'
import axios from 'axios';
import { useSelector } from 'react-redux';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const Library = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({ label: '', link: '' });
  const [editingResource, setEditingResource] = useState(null);
  const userRole = useSelector((state) => state.user.role);
  const isTeacher = userRole === 'teacher' || userRole === 'admin';
  console.log(userRole)

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get('/resources');
      setResources(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to fetch resources');
      setLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/resources', newResource);
      setNewResource({ label: '', link: '' });
      setIsAddingResource(false);
      fetchResources();
    } catch (err) {
      console.error('Error adding resource:', err);
      setError('Failed to add resource');
    }
  };

  const handleUpdateResource = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/resources/${editingResource.id}`, editingResource);
      setEditingResource(null);
      fetchResources();
    } catch (err) {
      console.error('Error updating resource:', err);
      setError('Failed to update resource');
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await axios.delete(`/resources/${id}`);
      fetchResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Failed to delete resource');
    }
  };

  if (loading) return <div className="loading">Loading resources...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="library-container">
      <h2>Library Resources</h2>
      
      {isTeacher && (
        <div className="resource-management">
          {!isAddingResource && !editingResource && (
            <button 
              className="nes-btn is-primary"
              onClick={() => setIsAddingResource(true)}
            >
              Add New Resource
            </button>
          )}

          {isAddingResource && (
            <form onSubmit={handleAddResource} className="resource-form">
              <input
                type="text"
                placeholder="Resource Label"
                value={newResource.label}
                onChange={(e) => setNewResource({ ...newResource, label: e.target.value })}
                className="nes-input"
                required
              />
              <input
                type="url"
                placeholder="Resource Link"
                value={newResource.link}
                onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                className="nes-input"
                required
              />
              <button type="submit" className="nes-btn is-success">Save</button>
              <button 
                type="button" 
                className="nes-btn is-error"
                onClick={() => setIsAddingResource(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      <div className="resources-grid">
        {resources.map((resource) => (
          <div key={resource.id} className="resource-card">
            {editingResource?.id === resource.id ? (
              <form onSubmit={handleUpdateResource} className="resource-form">
                <input
                  type="text"
                  value={editingResource.label}
                  onChange={(e) => setEditingResource({ ...editingResource, label: e.target.value })}
                  className="nes-input"
                  required
                />
                <input
                  type="url"
                  value={editingResource.link}
                  onChange={(e) => setEditingResource({ ...editingResource, link: e.target.value })}
                  className="nes-input"
                  required
                />
                <button type="submit" className="nes-btn is-success">Save</button>
                <button 
                  type="button" 
                  className="nes-btn is-error"
                  onClick={() => setEditingResource(null)}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <a 
                  href={resource.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="resource-link"
                >
                  {resource.label}
                </a>
                {isTeacher && (
                  <div className="resource-actions">
                    <button 
                      className="nes-btn is-warning"
                      onClick={() => setEditingResource(resource)}
                    >
                      Edit
                    </button>
                    <button 
                      className="nes-btn is-error"
                      onClick={() => handleDeleteResource(resource.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
