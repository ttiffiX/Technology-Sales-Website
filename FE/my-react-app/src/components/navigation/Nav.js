import CartClicked from "../../utils/CartClicked";
import React, {useState} from "react";
import "./Nav.scss"
import {Link, useNavigate} from "react-router-dom";
import avatarIcon from "../../assets/icon/img.png";

function Nav({count}) {
    // Trạng thái đăng nhập và thông tin người dùng
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [userName, setUserName] = useState("");
    // const [userAvatar, setUserAvatar] = useState("");
    const [userAvatar, setUserAvatar] = useState(avatarIcon);
    const navigate = useNavigate();

    // Xử lý đăng nhập (demo)
    const handleLogin = () => {
        // Giả sử sau khi đăng nhập, thông tin người dùng được lưu:
        setIsLoggedIn(true);
        setUserName("John Doe"); // Gán tên user tạm thời
        setIsLoggedIn(true);
        setUserAvatar(avatarIcon); // Link demo ảnh đại diện
        // navigate("/login");
    };

    // Xử lý đăng xuất
    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserName("");
    };

    function handleProfile() {
        navigate("/profile");
    }

    function handlePlacedOrder(){
        navigate("/placedorder")
    }

    return (
        <div className={"navigation"}>
            <Link to="/" className="shopName">Magic Shop</Link>
            <Link to="/" className={"shop"}>Shop</Link>
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
                        <button onClick={handlePlacedOrder}>Placed Orders</button>
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