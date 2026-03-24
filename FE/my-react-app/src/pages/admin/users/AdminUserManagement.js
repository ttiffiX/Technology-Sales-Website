import React, { useEffect, useMemo, useState } from 'react';
import {
    addAdminUser,
    deleteAdminUser,
    getAdminRoles,
    getAdminUsers,
    updateAdminUserBanStatus,
    updateAdminUserRole,
} from '../../../api/AdminAPI';
import AddUserModal from '../../../components/modal/adduser/AddUserModal';
import DeleteUserModal from '../../../components/modal/deleteuser/DeleteUserModal';
import { useToast } from '../../../components/Toast/Toast';
import { formatDateTimeOrFallback, getApiErrorMessage, passwordsMatch } from '../../../utils';
import './AdminUserManagement.scss';

const EMPTY_ADD_USER_FORM = {
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    name: '',
    role: 'PM',
};

function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [addUserForm, setAddUserForm] = useState(EMPTY_ADD_USER_FORM);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(false);
    const { triggerToast } = useToast();

    const getDefaultRole = (roleOptions = roles) => roleOptions[0] || 'PM';

    const loadUsers = async () => {
        setLoading(true);
        try {
            const [userData, roleData] = await Promise.all([getAdminUsers(), getAdminRoles()]);
            setUsers(userData);
            setRoles(roleData);
            setAddUserForm((prev) => ({
                ...prev,
                role: roleData.includes(prev.role) ? prev.role : getDefaultRole(roleData),
            }));
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to load user list'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.isActive && !u.isBanned).length;
        const banned = users.filter((u) => u.isBanned).length;
        return { total, active, banned };
    }, [users]);

    const handleBanToggle = async (user) => {
        const nextStatus = !user.isBanned;
        setUpdatingId(user.id);

        try {
            const updated = await updateAdminUserBanStatus(user.id, nextStatus);
            setUsers((prev) => prev.map((item) => (item.id === user.id ? { ...item, ...updated } : item)));
            triggerToast('success', nextStatus ? 'User has been banned' : 'User has been unbanned');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to update ban status'));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRoleChange = async (userId, role) => {
        setUpdatingId(userId);

        try {
            const updated = await updateAdminUserRole(userId, role);
            setUsers((prev) => prev.map((item) => (item.id === userId ? { ...item, ...updated } : item)));
            triggerToast('success', 'Role updated successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to update role'));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAddUserInputChange = (event) => {
        const { name, value } = event.target;
        setAddUserForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = async (event) => {
        event.preventDefault();

        if (!passwordsMatch(addUserForm.password, addUserForm.confirmPassword)) {
            triggerToast('error', 'Password and confirm password do not match');
            return;
        }

        setCreatingUser(true);

        try {
            const created = await addAdminUser(addUserForm);
            setUsers((prev) => [created, ...prev]);
            setAddUserForm((prev) => ({
                ...EMPTY_ADD_USER_FORM,
                role: roles.includes(prev.role) ? prev.role : getDefaultRole(),
            }));
            setAddUserModalOpen(false);
            triggerToast('success', 'User created successfully');
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to create user'));
        } finally {
            setCreatingUser(false);
        }
    };

    const handleDeleteUser = async (user) => {
        setDeletingUser(user);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async (adminPassword) => {
        if (!deletingUser) {
            return;
        }

        setDeletingUserId(true);
        try {
            await deleteAdminUser(deletingUser.id, adminPassword);
            setUsers((prev) => prev.filter((item) => item.id !== deletingUser.id));
            triggerToast('success', 'User deleted successfully');
            setDeleteModalOpen(false);
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to delete user'));
        } finally {
            setDeletingUserId(false);
        }
    };

    if (loading) {
        return <div className="admin-users__loading">Loading user data...</div>;
    }

    return (
        <section className="admin-users">
            <header className="admin-users__header">
                <h2 className="admin-users__title">User Management</h2>
                <div className="admin-users__header-actions">
                    <button
                        className="admin-users__add-user"
                        onClick={() => {
                            setAddUserForm((prev) => ({
                                ...prev,
                                role: roles.includes(prev.role) ? prev.role : getDefaultRole(),
                            }));
                            setAddUserModalOpen(true);
                        }}
                    >
                        Add User
                    </button>
                    <button className="admin-users__reload" onClick={loadUsers}>
                        Reload
                    </button>
                </div>
            </header>

            <AddUserModal
                isOpen={addUserModalOpen}
                onClose={() => {
                    setAddUserModalOpen(false);
                    setAddUserForm({ ...EMPTY_ADD_USER_FORM, role: getDefaultRole() });
                }}
                onSubmit={handleCreateUser}
                loading={creatingUser}
                form={addUserForm}
                roles={roles}
                onChange={handleAddUserInputChange}
            />

            <DeleteUserModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeletingUser(null);
                }}
                onSubmit={handleConfirmDelete}
                loading={deletingUserId}
                userName={deletingUser?.username || ''}
            />

            <div className="admin-users__stats">
                <div className="admin-users__stat-card">
                    <span>Total users</span>
                    <strong>{stats.total}</strong>
                </div>
                <div className="admin-users__stat-card">
                    <span>Active users</span>
                    <strong>{stats.active}</strong>
                </div>
                <div className="admin-users__stat-card">
                    <span>Banned users</span>
                    <strong>{stats.banned}</strong>
                </div>
            </div>

            <div className="admin-users__table-wrapper">
                <table className="admin-users__table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created at</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => {
                        const isUpdating = updatingId === user.id;
                        return (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.username}</td>
                                <td>{user.email || '-'}</td>
                                <td>{user.phone || '-'}</td>
                                <td>
                                    <select
                                        className="admin-users__role-select"
                                        value={user.role || ''}
                                        disabled={isUpdating}
                                        onChange={(event) => handleRoleChange(user.id, event.target.value)}
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <span className={`admin-users__status ${user.isBanned ? 'banned' : 'active'}`}>
                                        {user.isBanned ? 'Banned' : 'Active'}
                                    </span>
                                </td>
                                <td>{formatDateTimeOrFallback(user.createdAt)}</td>
                                <td>
                                    <div className="admin-users__actions">
                                        <button
                                            className={`admin-users__ban-btn ${user.isBanned ? 'unban' : 'ban'}`}
                                            disabled={isUpdating}
                                            onClick={() => handleBanToggle(user)}
                                        >
                                            {user.isBanned ? 'Unban' : 'Ban'}
                                        </button>
                                        <button
                                            className="admin-users__delete-btn"
                                            disabled={isUpdating}
                                            onClick={() => handleDeleteUser(user)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default AdminUserManagement;


