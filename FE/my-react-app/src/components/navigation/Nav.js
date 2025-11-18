import CartClicked from "../../utils/CartClicked";
import React, {useEffect, useState} from "react";
import "./Nav.scss"
import {Link, useNavigate} from "react-router-dom";
import avatarIcon from "../../assets/icon/img.png";
import {isAuthenticated, getCurrentUser, logout} from "../../api/AuthAPI";

function Nav({count}) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState("");
    const [userAvatar, setUserAvatar] = useState(avatarIcon);
    const navigate = useNavigate();

    // Kiểm tra authentication khi component mount
    useEffect(() => {
        const checkAuth = () => {
            if (isAuthenticated()) {
                const user = getCurrentUser();
                setIsLoggedIn(true);
                setUserName(user.name || user.username);
                setUserAvatar(user.imageUrl || avatarIcon);
            } else {
                setIsLoggedIn(false);
                setUserName("");
                setUserAvatar(avatarIcon);
            }
        };

        checkAuth();

        // Lắng nghe sự kiện storage để cập nhật khi login/logout từ tab khác
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    // Xử lý đăng nhập
    const handleLogin = () => {
        navigate("/login");
    };

    // Xử lý đăng xuất
    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setUserName("");
        setUserAvatar(avatarIcon);
        window.alert(`Logout successfully`);
        navigate("/");
    };

    function handleProfile() {
        navigate("/profile");
    }

    function handlePlacedOrder(){
        navigate("/placedorder")
    }

    // Handle navigate to home and clear all filters
    const handleNavigateHome = (e) => {
        e.preventDefault();
        navigate('/', { replace: true });
        // Force reload to clear any cached state
        window.location.href = '/';
    };

    return (
        <div className={"navigation"}>
            <Link to="/" className="shopName" onClick={handleNavigateHome}>Magic Shop</Link>
            <Link to="/" className={"shop"} onClick={handleNavigateHome}>Shop</Link>
            <Link to="/aboutme" className={"aboutMe"}>About Me</Link>
            {/* Hiển thị Login hoặc Tên User */}
            {isLoggedIn ? (
                <div className="user-dropdown">
                    <div className="avatar-container">
                        <img src={userAvatar} alt="" className="user-avatar"/>
                    </div>
                    <div className="dropdown-menu">
                        {/*<Link to="/profile">My Profile</Link>*/}
                        <button onClick={handleProfile}>My Profile</button>
                        <button onClick={handlePlacedOrder}>Orders</button>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            ) : (
                // <Link to="/Login" className={"login-button"}>Login</Link>
                <button className="login-button" onClick={handleLogin}>Login</button>
            )}
            <CartClicked count={count}/>
        </div>
    );
}

export default Nav;