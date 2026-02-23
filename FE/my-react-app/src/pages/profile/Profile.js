import React, {useState, useEffect} from "react";
import "./Profile.scss";
import avatarIcon from "../../assets/icon/img.png";
import Nav from "../../components/navigation/Nav";
import {useCart} from "../../contexts/CartContext";
import ChangePasswordModal from "../../components/modal/changepass/ChangePasswordModal";
import AddressManagement from "../../components/modal/address/AddressManagement";
import {useToast} from "../../components/Toast/Toast";
import {getProfile, updateProfile} from "../../api/ProfileAPI";

const Profile = () => {
    const {cartCount} = useCart();
    const {triggerToast} = useToast();

    const [user, setUser] = useState({
        id: null,
        username: "",
        name: "",
        phone: "",
        email: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({...user});
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isAddressManagementOpen, setIsAddressManagementOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfileData();
    }, []);

    const loadProfileData = async () => {
        setLoading(true);
        const result = await getProfile();
        if (result.success) {
            setUser(result.data);
            setEditedUser(result.data);
        } else {
            triggerToast('error', result.message || 'Failed to load profile');
        }
        setLoading(false);
    };


    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        // Validate
        if (!editedUser.name.trim()) {
            triggerToast('error', 'Name is required');
            return;
        }
        if (!editedUser.phone.trim()) {
            triggerToast('error', 'Phone is required');
            return;
        }

        const result = await updateProfile({
            name: editedUser.name,
            phone: editedUser.phone
        });

        if (result.success) {
            setUser(result.data);
            setIsEditing(false);
            triggerToast('success', result.message || 'Profile updated successfully');
        } else {
            triggerToast('error', result.message || 'Failed to update profile');
        }
    };

    const handleCancelEdit = () => {
        setEditedUser({...user});
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setEditedUser({...editedUser, [name]: value});
    };

    const handleChangePasswordClick = () => {
        setIsChangePasswordModalOpen(true);
    };

    const handleCloseChangePasswordModal = () => {
        setIsChangePasswordModalOpen(false);
    };

    const handlePasswordChangeSuccess = (message) => {
        triggerToast('success', message || 'Password changed successfully!');
    };

    const handleAddressManagementClick = () => {
        setIsAddressManagementOpen(true);
    };

    const handleAddressManagementClose = () => {
        setIsAddressManagementOpen(false);
    };

    const handleAddressSuccess = (message) => {
        triggerToast('success', message);
    };

    if (loading) {
        return (
            <div>
                <Nav count={cartCount}/>
                <div className="profile-container">
                    <div className="loading">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Nav count={cartCount}/>
            <div className="profile-container">
                <div className="profile-left">
                    <div className="avatar">
                        <img src={avatarIcon} alt="Avatar"/>
                    </div>
                    <div className="username">{user.username}</div>
                </div>

                <div className="profile-right">
                    <div className="info-item">
                        <label>Username</label>
                        <span>{user.username}</span>
                    </div>

                    <div className="info-item">
                        <label>Email</label>
                        <span>{user.email}</span>
                    </div>

                    <div className="info-item">
                        <label>Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={editedUser.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                            />
                        ) : (
                            <span>{user.name || 'Not set'}</span>
                        )}
                    </div>

                    <div className="info-item">
                        <label>Phone</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="phone"
                                value={editedUser.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                            />
                        ) : (
                            <span>{user.phone || 'Not set'}</span>
                        )}
                    </div>

                    <div className="info-item address-section">
                        <label>Address</label>
                        <button
                            className="btn-address-arrow"
                            onClick={handleAddressManagementClick}
                        >
                            <span className="arrow-label">Management</span>
                            <span className="arrow-icon">›</span>
                        </button>
                    </div>

                    {isEditing ? (
                        <div className="buttons">
                            <button onClick={handleSaveClick} className="btn-save">Save</button>
                            <button onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
                        </div>
                    ) : (
                        <div className="buttons">
                            <button onClick={handleEditClick}>Edit Profile</button>
                            <button onClick={handleChangePasswordClick} className="btn-change-password">
                                Change Password
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={handleCloseChangePasswordModal}
                onSuccess={handlePasswordChangeSuccess}
            />

            {/* Address Management Modal */}
            <AddressManagement
                isOpen={isAddressManagementOpen}
                onClose={handleAddressManagementClose}
                onSuccess={handleAddressSuccess}
            />
        </div>
    );
};

export default Profile;
