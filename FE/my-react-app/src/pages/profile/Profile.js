import React, {useState} from "react";
import "./Profile.scss";  // Chúng ta sẽ tạo file SCSS sau
import avatarIcon from "../../assets/icon/img.png";
import Nav from "../../components/navigation/Nav";
import {useCart} from "../../contexts/CartContext";
import ChangePasswordModal from "../../components/modal/changepass/ChangePasswordModal";
import {useToast} from "../../components/Toast/Toast";

const Profile = () => {
    const {cartCount} = useCart();
    const {triggerToast} = useToast();

    // Giả sử bạn đã có các dữ liệu người dùng như avatar, tên, v.v. từ API hoặc qua props.
    const [user, setUser] = useState({
        avatar: avatarIcon,
        username: "ttiffiX",
        name: "Sang Phạm",
        age: 20,
        dob: "10-02-2004",
        gender: "Male",
        phone: "",
        address: "",
        email: "sangpham1224@gmail.com",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({...user});
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        // Có thể gửi yêu cầu cập nhật đến server tại đây nếu cần
        setUser(editedUser);
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

    return (
        <div>
            <Nav count={cartCount}/>
            <div className="profile-container">
                <div className="profile-left">
                    <div className="avatar">
                        <img src={user.avatar} alt="Avatar"/>
                    </div>
                    <div className="username">{user.username}</div>
                </div>

                <div className="profile-right">
                    <div className="info-item">
                        <label>Name</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={editedUser.name}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.name}</span>
                        )}
                    </div>

                    <div className="info-item">
                        <label>Age</label>
                        {isEditing ? (
                            <input
                                type="number"
                                name="age"
                                value={editedUser.age}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.age}</span>
                        )}
                    </div>

                    <div className="info-item">
                        <label>Phone</label>
                        {isEditing ? (
                            <input
                                type="number"
                                maxLength={10}
                                name="phone"
                                value={editedUser.phone}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.phone}</span>
                        )}
                    </div>

                    <div className="info-item">
                        <label>Address</label>
                        {isEditing ? (
                            <input
                                type="text"
                                name="address"
                                value={editedUser.address}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.address}</span>
                        )}
                    </div>

                    <div className="info-item">
                        <label>Date of Birth</label>
                        {isEditing ? (
                            <input
                                type="date"
                                name="dob"
                                value={editedUser.dob}
                                onChange={handleChange}
                            />
                        ) : (
                            <span>{user.dob}</span>
                        )}
                    </div>

                    <div className="info-item">
                        <label>Gender</label>
                        {isEditing ? (
                            <select
                                name="gender"
                                value={editedUser.gender}
                                onChange={handleChange}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        ) : (
                            <span>{user.gender}</span>
                        )}
                    </div>

                    <div className="info-item">
                        <label>Email</label>
                        <span>{user.email}</span>
                    </div>

                    {isEditing && (
                        <div className="buttons">
                            <button onClick={handleSaveClick}>Save</button>
                        </div>
                    )}

                    {!isEditing && (
                        <div className="buttons">
                            <button onClick={handleEditClick}>Edit</button>
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
        </div>
    );
};

export default Profile;
