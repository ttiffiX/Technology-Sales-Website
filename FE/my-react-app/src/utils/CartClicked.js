import React, {useEffect, useState} from 'react';
import '../components/navigation/Nav.scss'
import {useNavigate} from 'react-router-dom';

function CartClicked({count}) {
    // const [color, setColor] = useState('white'); // Màu chữ mặc định
    // const [isChanging, setIsChanging] = useState(false); // Kiểm tra xem màu có thay đổi không
    const navigate = useNavigate();

    // useEffect(() => {
    //     if (count > 0) {
    //         setIsChanging(true); // Bắt đầu thay đổi màu
    //         setColor('red'); // Đổi màu thành đỏ
    //
    //         // Sau 1s, đổi lại màu cũ
    //         const timer = setTimeout(() => {
    //             setColor('white');
    //             setIsChanging(false);
    //         }, 450);
    //         return () => clearTimeout(timer); // Clean up khi component unmount hoặc count thay đổi
    //     }
    // }, [count]); // Chạy lại khi count thay đổi


    const handleClick = () => {
        navigate('/cart');
    }

    return (
        <div>
            <button className={"cartButton"} onClick={handleClick}>
                <span className={"cartText"}>
                {/*    🛒 <p>Cart(</p> <p style={{color: color}}>*/}
                {/*{isChanging ? `${count}` : `${count}`}</p>)*/}
                    🛒 <p>Cart({count})</p>
                </span>
            </button>
        </div>
    );
}

export default CartClicked;
