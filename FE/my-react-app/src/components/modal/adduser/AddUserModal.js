import React from 'react';
import './AddUserModal.scss';

function AddUserModal({
    isOpen,
    onClose,
    onSubmit,
    loading,
    form,
    roles,
    onChange,
}) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="admin-add-user-modal__overlay" onClick={onClose}>
            <div className="admin-add-user-modal" onClick={(event) => event.stopPropagation()}>
                <div className="admin-add-user-modal__header">
                    <div>
                        <h3>Add New User</h3>
                        <p>Create account for PM/Admin with required profile information.</p>
                    </div>
                    <button
                        type="button"
                        className="admin-add-user-modal__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form className="admin-add-user-modal__form" onSubmit={onSubmit}>
                    <div className="admin-add-user-modal__grid">
                        <label className="admin-add-user-modal__field">
                            <span>Username</span>
                            <input
                                name="username"
                                value={form.username}
                                onChange={onChange}
                                placeholder="Enter username"
                                autoComplete="username"
                                required
                            />
                        </label>

                        <label className="admin-add-user-modal__field">
                            <span>Full name</span>
                            <input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="Enter full name"
                                autoComplete="name"
                                required
                            />
                        </label>

                        <label className="admin-add-user-modal__field">
                            <span>Email</span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={onChange}
                                placeholder="example@email.com"
                                autoComplete="email"
                                required
                            />
                        </label>

                        <label className="admin-add-user-modal__field">
                            <span>Phone</span>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={onChange}
                                placeholder="Enter phone number"
                                autoComplete="tel"
                                required
                            />
                        </label>

                        <label className="admin-add-user-modal__field">
                            <span>Password</span>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder="Enter password"
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        <label className="admin-add-user-modal__field">
                            <span>Confirm password</span>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={onChange}
                                placeholder="Re-enter password"
                                autoComplete="new-password"
                                required
                            />
                        </label>

                        <label className="admin-add-user-modal__field admin-add-user-modal__field--full">
                            <span>Role</span>
                            <select
                                name="role"
                                value={form.role}
                                onChange={onChange}
                                required
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <div className="admin-add-user-modal__actions">
                        <button type="button" className="admin-add-user-modal__cancel" onClick={onClose} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" className="admin-add-user-modal__submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUserModal;


