import React, {useState, useEffect} from "react";
import "./AddressManagement.scss";
import {
    getAllAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from "../../../api/AddressAPI";
import {getAllProvinces, getWardsByProvinceCode} from "../../../api/ProvinceAPI";
import {useToast} from "../../Toast/Toast";

const AddressManagement = ({isOpen, onClose, onSuccess}) => {
    const {triggerToast} = useToast();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form state - only store what's needed to send to backend
    const [formData, setFormData] = useState({
        label: "",
        address: "",
        provinceCode: "",
        wardCode: "",
        isDefault: false
    });

    // Dropdown data
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingWards, setLoadingWards] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadAddresses();
            loadProvinces();
            // Reset về màn hình list mỗi khi mở modal
            setShowForm(false);
            setEditingId(null);
            setFormData({
                label: "",
                address: "",
                provinceCode: "",
                wardCode: "",
                isDefault: false
            });
            setWards([]);
        }
    }, [isOpen]);

    const loadAddresses = async () => {
        setLoading(true);
        const result = await getAllAddresses();
        if (result.success) {
            setAddresses(result.data);
        } else {
            triggerToast('error', result.message);
        }
        setLoading(false);
    };

    const loadProvinces = async () => {
        const result = await getAllProvinces();
        if (result.success) {
            setProvinces(result.data);
        } else {
            triggerToast('error', result.message);
        }
    };

    const loadWards = async (provinceCode) => {
        setLoadingWards(true);
        setWards([]);
        setFormData(prev => ({...prev, wardCode: ""}));

        const result = await getWardsByProvinceCode(provinceCode);
        if (result.success) {
            setWards(result.data);
        } else {
            triggerToast('error', result.message);
        }
        setLoadingWards(false);
    };

    const handleProvinceChange = (e) => {
        const selectedCode = e.target.value;

        setFormData(prev => ({
            ...prev,
            provinceCode: selectedCode,
            wardCode: ""
        }));

        if (selectedCode) {
            loadWards(selectedCode);
        } else {
            setWards([]);
        }
    };

    const handleWardChange = (e) => {
        const selectedCode = e.target.value;

        setFormData(prev => ({
            ...prev,
            wardCode: selectedCode
        }));
    };

    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddNew = () => {
        setShowForm(true);
        setEditingId(null);
        setFormData({
            label: "",
            address: "",
            provinceCode: "",
            wardCode: "",
            isDefault: false
        });
        setWards([]);
    };

    const handleEdit = (address) => {
        setShowForm(true);
        setEditingId(address.id);
        setFormData({
            label: address.label || "",
            address: address.address || "",
            provinceCode: address.provinceCode || "",
            wardCode: address.wardCode || "",
            isDefault: address.isDefault || false
        });

        // Load wards for selected province
        if (address.provinceCode) {
            loadWards(address.provinceCode);
        }
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            label: "",
            address: "",
            provinceCode: "",
            wardCode: "",
            isDefault: false
        });
        setWards([]);
    };

    const validateForm = () => {
        if (!formData.address.trim()) {
            triggerToast('error', 'Address is required');
            return false;
        }
        if (!formData.provinceCode) {
            triggerToast('error', 'Province is required');
            return false;
        }
        if (!formData.wardCode) {
            triggerToast('error', 'Ward is required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        let result;

        if (editingId) {
            result = await updateAddress(editingId, formData);
        } else {
            result = await createAddress(formData);
        }

        if (result.success) {
            triggerToast('success', result.message);
            onSuccess && onSuccess(result.message);
            loadAddresses();
            handleCancelForm();
        } else {
            triggerToast('error', result.message);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        setLoading(true);
        const result = await deleteAddress(id);
        if (result.success) {
            triggerToast('success', result.message);
            onSuccess && onSuccess(result.message);
            loadAddresses();
        } else {
            triggerToast('error', result.message);
        }
        setLoading(false);
    };

    const handleSetDefault = async (id) => {
        setLoading(true);
        const result = await setDefaultAddress(id);
        if (result.success) {
            triggerToast('success', result.message);
            onSuccess && onSuccess(result.message);
            loadAddresses();
        } else {
            triggerToast('error', result.message);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="address-management-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Address Management</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    {!showForm ? (
                        <>
                            <div className="addresses-header">
                                <h3>Your Addresses</h3>
                                <button className="btn-add-new" onClick={handleAddNew}>
                                    + Add New Address
                                </button>
                            </div>

                            {loading ? (
                                <div className="loading">Loading addresses...</div>
                            ) : addresses.length === 0 ? (
                                <div className="no-addresses">
                                    <p>No addresses found</p>
                                    <button className="btn-add-first" onClick={handleAddNew}>
                                        Add your first address
                                    </button>
                                </div>
                            ) : (
                                <div className="addresses-list">
                                    {addresses.map((address) => (
                                        <div key={address.id}
                                             className={`address-item ${address.isDefault ? 'default' : ''}`}>

                                            {/* top: label tag + default badge */}
                                            {(address.label || address.isDefault) && (
                                                <div className="card-top">
                                                    {address.label && (
                                                        <span className="address-label">{address.label}</span>
                                                    )}
                                                    {address.isDefault && (
                                                        <span className="default-badge">Default</span>
                                                    )}
                                                </div>
                                            )}

                                            {/* body: address text + location */}
                                            <div className="card-body">
                                                <div className="address-detail">{address.address}</div>
                                                <div className="address-location">
                                                    {address.wardName}, {address.provinceName}
                                                </div>
                                            </div>

                                            {/* actions */}
                                            <div className="address-actions">
                                                {!address.isDefault && (
                                                    <button
                                                        className="btn-set-default"
                                                        onClick={() => handleSetDefault(address.id)}
                                                        disabled={loading}
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(address)}
                                                    disabled={loading}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(address.id)}
                                                    disabled={loading}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <form className="address-form" onSubmit={handleSubmit}>
                            <p className="form-title">{editingId ? 'Edit Address' : 'Add New Address'}</p>

                            <div className="form-group">
                                <label>Label <span style={{color: '#888', fontWeight: 400}}>(optional)</span></label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Home, Office"
                                />
                            </div>

                            {/* Province & Ward side by side */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Province / City <span className="required">*</span></label>
                                    <select
                                        name="provinceCode"
                                        value={formData.provinceCode}
                                        onChange={handleProvinceChange}
                                        required
                                    >
                                        <option value="">Select Province</option>
                                        {provinces.map((province) => (
                                            <option key={province.province_code} value={province.province_code}>
                                                {province.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Ward / District <span className="required">*</span></label>
                                    <select
                                        name="wardCode"
                                        value={formData.wardCode}
                                        onChange={handleWardChange}
                                        disabled={!formData.provinceCode || loadingWards}
                                        required
                                    >
                                        <option value="">
                                            {loadingWards ? 'Loading...' : 'Select Ward'}
                                        </option>
                                        {wards.map((ward) => (
                                            <option key={ward.ward_code} value={ward.ward_code}>
                                                {ward.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Detailed Address <span className="required">*</span></label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="House number, street name..."
                                    required
                                />
                            </div>

                            {!editingId && (
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isDefault"
                                            checked={formData.isDefault}
                                            onChange={handleInputChange}
                                        />
                                        Set as default address
                                    </label>
                                </div>
                            )}

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={handleCancelForm}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (editingId ? 'Update' : 'Add Address')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressManagement;

