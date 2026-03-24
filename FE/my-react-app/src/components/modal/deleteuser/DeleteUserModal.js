import React, {useState} from 'react';
import './DeleteUserModal.scss';

function DeleteUserModal({
                             isOpen,
                             onClose,
                             onSubmit,
                             loading,
                             userName,
                         }) {
    const [password, setPassword] = useState('');

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!password.trim()) {
            return;
        }
        onSubmit(password);
    };

    const handleClose = () => {
        setPassword('');
        onClose();
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="admin-delete-modal__overlay" onClick={handleClose}>
            <div className="admin-delete-modal" onClick={(event) => event.stopPropagation()}>
                <div className="admin-delete-modal__header">
                    <div>
                        <h3>Confirm Delete</h3>
                        <p>Enter your admin password to confirm deletion.</p>
                    </div>
                    <button
                        type="button"
                        className="admin-delete-modal__close"
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                <form className="admin-delete-modal__form" onSubmit={handleSubmit}>
                    <div className="admin-delete-modal__warning">
                        <span>
                            Deleting user <strong>{userName}</strong> is permanent and cannot be undone.
                        </span>
                    </div>

                    <label className="admin-delete-modal__field">
                        <span>Admin Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Enter your admin password"
                            autoComplete="current-password"
                            required
                            disabled={loading}
                        />
                    </label>

                    <div className="admin-delete-modal__actions">
                        <button
                            type="button"
                            className="admin-delete-modal__cancel"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="admin-delete-modal__confirm"
                            disabled={loading || !password.trim()}
                        >
                            {loading ? 'Deleting...' : 'Delete User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DeleteUserModal;

