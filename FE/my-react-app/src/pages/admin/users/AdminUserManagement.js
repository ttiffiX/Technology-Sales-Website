import React, { useEffect, useMemo, useState } from 'react';
import {
    addAdminUser,
    deleteAdminUser,
    getAdminRoles,
    getAdminUsers,
    updateAdminUserBanStatus,
    updateAdminUserRole,
} from '../../../api/admin/AdminAPI';
import AddUserModal from '../../../components/modal/adduser/AddUserModal';
import DeleteUserModal from '../../../components/modal/deleteuser/DeleteUserModal';
import PaginationControls from '../../../components/pagination/PaginationControls';
import { useToast } from '../../../components/Toast/Toast';
import {
    formatDateTimeOrFallback,
    getApiErrorMessage,
    mapApiFieldErrors,
    passwordsMatch,
    normalizeAdminUserFilterParams,
    normalizeAdminUserPageResponse,
} from '../../../utils';
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
    const [pageNumber, setPageNumber] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;
    const [updatingId, setUpdatingId] = useState(null);
    const [creatingUser, setCreatingUser] = useState(false);
    const [addUserModalOpen, setAddUserModalOpen] = useState(false);
    const [addUserForm, setAddUserForm] = useState(EMPTY_ADD_USER_FORM);
    const [addUserErrors, setAddUserErrors] = useState({});
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingUser, setDeletingUser] = useState(null);
    const [deletingUserId, setDeletingUserId] = useState(false);
    const { triggerToast } = useToast();

    const getDefaultRole = (roleOptions = roles) => roleOptions[0] || 'PM';

    const [searchKeywordInput, setSearchKeywordInput] = useState('');
    const [appliedKeyword, setAppliedKeyword] = useState('');
    const [filterRoleInput, setFilterRoleInput] = useState('');
    const [appliedRole, setAppliedRole] = useState('');

    const displayUsers = users;

    const loadUsers = async (nextPage = pageNumber, nextKeyword = appliedKeyword, nextRole = appliedRole) => {
        setLoading(true);
        try {
            const params = normalizeAdminUserFilterParams({
                keyword: nextKeyword,
                role: nextRole,
                page: nextPage,
                size: pageSize,
            });

            const rawData = await getAdminUsers(params);
            const pageData = normalizeAdminUserPageResponse(rawData);
            const rows = Array.isArray(pageData.content) ? pageData.content : [];

            setUsers(rows);
            setPageNumber(Number.isFinite(pageData.pageNumber) ? pageData.pageNumber : nextPage);
            setTotalPages(Number.isFinite(pageData.totalPages) ? pageData.totalPages : 0);
            setTotalElements(Number.isFinite(pageData.totalElements) ? pageData.totalElements : rows.length);
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to load user list'));
            setUsers([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const roleData = await getAdminRoles();
            setRoles(roleData);
            setAddUserForm((prev) => ({
                ...prev,
                role: roleData.includes(prev.role) ? prev.role : getDefaultRole(roleData),
            }));
        } catch (error) {
            triggerToast('error', getApiErrorMessage(error, 'Failed to load roles'));
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    useEffect(() => {
        loadUsers(pageNumber, appliedKeyword, appliedRole);
    }, [pageNumber, appliedKeyword, appliedRole]);

    const handleSearchSubmit = (event) => {
        if (event.key === 'Enter') {
            setAppliedKeyword(searchKeywordInput.trim());
            setAppliedRole(filterRoleInput);
            setPageNumber(0);
        }
    };

    const handleApplyFilters = () => {
        setAppliedKeyword(searchKeywordInput.trim());
        setAppliedRole(filterRoleInput);
        setPageNumber(0);
    };

    const handleClearFilters = () => {
        setSearchKeywordInput('');
        setFilterRoleInput('');
        setAppliedKeyword('');
        setAppliedRole('');
        setPageNumber(0);
    };

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
            await updateAdminUserBanStatus(user.id, nextStatus);
            await loadUsers(pageNumber, appliedKeyword, appliedRole);
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
            await updateAdminUserRole(userId, role);
            await loadUsers(pageNumber, appliedKeyword, appliedRole);
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
        setAddUserErrors((prev) => {
            if (!prev[name] && !prev.general) {
                return prev;
            }
            const next = { ...prev };
            delete next[name];
            delete next.general;
            return next;
        });
    };


    const handleCreateUser = async (event) => {
        event.preventDefault();
        setAddUserErrors({});

        if (!passwordsMatch(addUserForm.password, addUserForm.confirmPassword)) {
            setAddUserErrors({ confirmPassword: 'Passwords do not match' });
            triggerToast('error', 'Password and confirm password do not match');
            return;
        }

        setCreatingUser(true);

        try {
            await addAdminUser(addUserForm);
            setPageNumber(0);
            await loadUsers(0, appliedKeyword, appliedRole);
            setAddUserForm((prev) => ({
                ...EMPTY_ADD_USER_FORM,
                role: roles.includes(prev.role) ? prev.role : getDefaultRole(),
            }));
            setAddUserErrors({});
            setAddUserModalOpen(false);
            triggerToast('success', 'User created successfully');
        } catch (error) {
            const mappedErrors = mapApiFieldErrors(error, 'Failed to create user');
            setAddUserErrors(mappedErrors);
            triggerToast('error', mappedErrors.general || getApiErrorMessage(error, 'Failed to create user'));
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
            await loadUsers(pageNumber, appliedKeyword, appliedRole);
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
                            setAddUserErrors({});
                            setAddUserModalOpen(true);
                        }}
                    >
                        Add User
                    </button>
                </div>
            </header>

            <div className="admin-users__filters">
                <input
                    type="text"
                    className="admin-users__search-input"
                    placeholder="Search by username or email..."
                    value={searchKeywordInput}
                    onChange={(event) => setSearchKeywordInput(event.target.value)}
                    onKeyDown={handleSearchSubmit}
                />

                <select
                    className="admin-users__filter-select"
                    value={filterRoleInput}
                    onChange={(event) => setFilterRoleInput(event.target.value)}
                >
                    <option value="">All Roles</option>
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </select>

                {(searchKeywordInput || filterRoleInput) && (
                    <button
                        className="admin-users__clear-filters"
                        onClick={handleClearFilters}
                    >
                        Clear
                    </button>
                )}

                <button className="admin-users__apply-filters" onClick={handleApplyFilters}>
                    Apply
                </button>
            </div>

            <AddUserModal
                isOpen={addUserModalOpen}
                onClose={() => {
                    setAddUserModalOpen(false);
                    setAddUserForm({ ...EMPTY_ADD_USER_FORM, role: getDefaultRole() });
                    setAddUserErrors({});
                }}
                onSubmit={handleCreateUser}
                loading={creatingUser}
                form={addUserForm}
                roles={roles}
                onChange={handleAddUserInputChange}
                errors={addUserErrors}
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
                    <strong>{totalElements}</strong>
                </div>
                <div className="admin-users__stat-card">
                    <span>Current page active</span>
                    <strong>{stats.active}</strong>
                </div>
                <div className="admin-users__stat-card">
                    <span>Current page banned</span>
                    <strong>{stats.banned}</strong>
                </div>
            </div>

            <div className="admin-users__table-wrapper">
                {!loading && displayUsers.length === 0 ? (
                    <div className="admin-users__empty-state">
                        <p>No results found</p>
                        <small>
                            {searchKeywordInput && `No users match "${searchKeywordInput}"`}
                            {filterRoleInput && `No users with role "${filterRoleInput}"`}
                        </small>
                    </div>
                ) : (
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
                    {displayUsers.map((user) => {
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
                )}
            </div>

            {!loading && (
                <PaginationControls
                    page={pageNumber}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    onPageChange={setPageNumber}
                    disabled={loading}
                />
            )}
        </section>
    );}


export default AdminUserManagement;


