import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import './UserManagement.css';
import { SET_USER } from '../../reducers/mapReducer';

axios.defaults.baseURL = `http://localhost:5002`;
// axios.defaults.withCredentials = true;

const UserManagement = () => {
  const userRole = useSelector((state) => state.user.role);


  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleSave = async (userId) => {
    try {
      await axios.put(`/users/${userId}`, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user');
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({
      name: '',
      email: '',
      role: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async () => {
    try {
      if (!newPassword) {
        setPasswordError('Le mot de passe ne peut pas être vide');
        return;
      }
      await axios.put(`/users/${selectedUserId}/password`, { password: newPassword });
      setShowPasswordModal(false);
      setNewPassword('');
      setPasswordError('');
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError('Failed to update password');
    }
  };

  if (loading) return <div className="loading">Chargement des utilisateurs...</div>;
  if (error) return <div className="error">{error}</div>;
  if (userRole !== 'admin') return <div>Vous n'avez pas les permissions pour accéder à cette page</div>

  return (
    <div className="user-management">
      <h2>Gestion des Utilisateurs</h2>
      <div className="user-list">
        <table className="nes-table is-bordered is-centered">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="nes-input"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                      className="nes-input"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <select 
                      name="role"
                      value={editForm.role}
                      onChange={handleInputChange}
                      className="nes-select"
                    >
                      <option value="student">Étudiant</option>
                      <option value="teacher">Professeur</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <div className="action-buttons">
                      <button 
                        className="nes-btn is-success"
                        onClick={() => handleSave(user.id)}
                      >
                        Sauvegarder
                      </button>
                      <button 
                        className="nes-btn is-error"
                        onClick={handleCancel}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button 
                        className="nes-btn is-primary"
                        onClick={() => handleEdit(user)}
                      >
                        Modifier
                      </button>
                      <button 
                        className="nes-btn is-warning"
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setShowPasswordModal(true);
                        }}
                      >
                        Changer mot de passe
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal nes-container is-rounded is-dark">
            <h3>Changer le mot de passe</h3>
            {passwordError && <div className="error-message">{passwordError}</div>}
            <input
              type="password"
              className="nes-input"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="modal-buttons">
              <button 
                className="nes-btn is-success"
                onClick={handlePasswordChange}
              >
                Confirmer
              </button>
              <button 
                className="nes-btn is-error"
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setPasswordError('');
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 