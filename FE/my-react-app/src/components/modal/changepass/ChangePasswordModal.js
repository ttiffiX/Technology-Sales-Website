import React, { useState } from 'react';
import './ChangePasswordModal.scss';
import { changePassword } from '../../../api/AuthAPI';
import { isRequired, isValidPassword, passwordsMatch, isPasswordDifferent } from '../../../utils';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate old password
        if (!isRequired(formData.oldPassword)) {
            newErrors.oldPassword = 'Old password is required';
        }

        // Validate new password
        if (!isRequired(formData.newPassword)) {
            newErrors.newPassword = 'New password is required';
        } else if (!isValidPassword(formData.newPassword)) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        // Validate confirm password
        if (!isRequired(formData.confirmPassword)) {
            newErrors.confirmPassword = 'Please confirm your new password';
        } else if (!passwordsMatch(formData.newPassword, formData.confirmPassword)) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Check if old and new passwords are different
        if (formData.oldPassword && formData.newPassword && !isPasswordDifferent(formData.oldPassword, formData.newPassword)) {
            newErrors.newPassword = 'New password must be different from old password';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await changePassword(
                formData.oldPassword,
                formData.newPassword,
                formData.confirmPassword
            );

            if (result.success) {
                // Reset form
                setFormData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                });
                setErrors({});

                // Call success callback
                if (onSuccess) {
                    onSuccess(result.message);
                }

                // Close modal
                onClose();
            } else {
                // Set general message trước
                const errs = { general: result.message };
                // Spread per-field errors từ BE nếu có (vd: { newPassword: "must contain uppercase..." })
                if (result.errors) {
                    Object.assign(errs, result.errors);
                }
                setErrors(errs);
            }
        } catch (error) {
            setErrors({
                general: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content change-password-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Change Password</h2>
                    <button className="close-btn" onClick={handleClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {errors.general && (
                        <div className="error-message general-error">
                            {errors.general}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="oldPassword">
                            Old Password <span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            id="oldPassword"
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            className={errors.oldPassword ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.oldPassword && (
                            <span className="error-text">{errors.oldPassword}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="newPassword">
                            New Password <span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={errors.newPassword ? 'error' : ''}
                            disabled={loading}
                            placeholder="At least 6 characters"
                        />
                        {errors.newPassword && (
                            <span className="error-text">{errors.newPassword}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm New Password <span className="required">*</span>
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'error' : ''}
                            disabled={loading}
                        />
                        {errors.confirmPassword && (
                            <span className="error-text">{errors.confirmPassword}</span>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
