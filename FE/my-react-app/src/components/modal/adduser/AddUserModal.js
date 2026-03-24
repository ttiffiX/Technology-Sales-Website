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
    errors = {},
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
                    {errors.general && (
                        <div className="admin-add-user-modal__error-box">{errors.general}</div>
                    )}

                    <div className="admin-add-user-modal__grid">
                        <label className="admin-add-user-modal__field">
                            <span>Username</span>
                            <input
                                name="username"
                                value={form.username}
                                onChange={onChange}
                                placeholder="Enter username"
                                autoComplete="username"
                                className={errors.username ? 'error' : ''}
                                required
                            />
                            {errors.username && <small className="admin-add-user-modal__field-error">{errors.username}</small>}
                        </label>

                        <label className="admin-add-user-modal__field">
                            <span>Full name</span>
                            <input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="Enter full name"
                                autoComplete="name"
                                className={errors.name ? 'error' : ''}
                                required
                            />
                            {errors.name && <small className="admin-add-user-modal__field-error">{errors.name}</small>}
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
                                className={errors.email ? 'error' : ''}
                                required
                            />
                            {errors.email && <small className="admin-add-user-modal__field-error">{errors.email}</small>}
                        </label>

                        <label className="admin-add-user-modal__field">
                            <span>Phone</span>
                            <input
                                name="phone"
                                value={form.phone}
                                onChange={onChange}
                                placeholder="Enter phone number"
                                autoComplete="tel"
                                className={errors.phone ? 'error' : ''}
                                required
                            />
                            {errors.phone && <small className="admin-add-user-modal__field-error">{errors.phone}</small>}
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
                                className={errors.password ? 'error' : ''}
                                required
                            />
                            {errors.password && <small className="admin-add-user-modal__field-error">{errors.password}</small>}
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
                                className={errors.confirmPassword ? 'error' : ''}
                                required
                            />
                            {errors.confirmPassword && (
                                <small className="admin-add-user-modal__field-error">{errors.confirmPassword}</small>
                            )}
                        </label>

                        <label className="admin-add-user-modal__field admin-add-user-modal__field--full">
                            <span>Role</span>
                            <select
                                name="role"
                                value={form.role}
                                onChange={onChange}
                                className={errors.role ? 'error' : ''}
                                required
                            >
                                {roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            {errors.role && <small className="admin-add-user-modal__field-error">{errors.role}</small>}
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


