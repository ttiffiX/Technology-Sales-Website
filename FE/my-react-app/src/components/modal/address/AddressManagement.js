import React, {useEffect, useMemo, useRef, useState} from "react";
import "./AddressManagement.scss";
import {
    createAddress,
    deleteAddress,
    getAllAddresses,
    setDefaultAddress,
    updateAddress
} from "../../../api/customer/AddressAPI";
import {getAllProvinces, getWardsByProvinceCode} from "../../../api/customer/ProvinceAPI";
import {useToast} from "../../Toast/Toast";

const normalizeText = (value) => String(value ?? "").toLowerCase().trim();
const getProvinceCode = (province) => province?.provinceCode ?? province?.province_code ?? "";
const getWardCode = (ward) => ward?.wardCode ?? ward?.ward_code ?? "";

// --- Sub-component: InlineSearchDropdown ---
const InlineSearchDropdown = ({
                                  label,
                                  required = false,
                                  placeholder,
                                  searchPlaceholder,
                                  emptyText,
                                  disabled = false,
                                  value,
                                  options = [],
                                  onChange,
                                  getOptionValue,
                                  getOptionLabel,
                                  getOptionSearchText,
                              }) => {
    const wrapperRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) setSearch("");
    }, [isOpen]);

    const selectedOption = useMemo(
        () => options.find((option) => getOptionValue(option) === value) || null,
        [options, value, getOptionValue]
    );

    const filteredOptions = useMemo(() => {
        const term = normalizeText(search);
        const matched = term
            ? options.filter((option) => normalizeText(getOptionSearchText(option)).includes(term))
            : options;
        if (!selectedOption) return matched;
        const selectedValue = getOptionValue(selectedOption);
        if (selectedValue && !matched.some((option) => getOptionValue(option) === selectedValue)) {
            return [selectedOption, ...matched];
        }
        return matched;
    }, [search, options, selectedOption, getOptionSearchText, getOptionValue]);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div ref={wrapperRef} className={`inline-search-dropdown ${isOpen ? "open" : ""} ${disabled ? "disabled" : ""}`}>
            <label>{label} {required && <span className="required">*</span>}</label>
            <button type="button" className="inline-search-dropdown__trigger" onClick={() => !disabled && setIsOpen(p => !p)} disabled={disabled}>
                <span className={`inline-search-dropdown__trigger-text ${selectedOption ? "" : "placeholder"}`}>
                    {selectedOption ? getOptionLabel(selectedOption) : placeholder}
                </span>
                <span className="inline-search-dropdown__arrow">▾</span>
            </button>
            {isOpen && !disabled && (
                <div className="inline-search-dropdown__menu">
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} className="inline-search-dropdown__search" autoFocus />
                    <div className="inline-search-dropdown__options">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const optionValue = getOptionValue(option);
                                const isSelected = optionValue === value;
                                return (
                                    <button key={optionValue} type="button" className={`inline-search-dropdown__option ${isSelected ? "selected" : ""}`} onClick={() => handleSelect(option)}>
                                        <span className="inline-search-dropdown__option-label">{getOptionLabel(option)}</span>
                                        {isSelected && <span className="inline-search-dropdown__option-check">✓</span>}
                                    </button>
                                );
                            })
                        ) : (<div className="inline-search-dropdown__empty">{emptyText}</div>)}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
const AddressManagement = ({isOpen, onClose, selectionMode = false, onSelectAddress}) => {
    const {triggerToast} = useToast();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [loadingWards, setLoadingWards] = useState(false);
    const [formData, setFormData] = useState({ label: "", address: "", provinceCode: "", wardCode: "", isDefault: false });

    const resetForm = () => {
        setFormData({ label: "", address: "", provinceCode: "", wardCode: "", isDefault: false });
        setWards([]);
    };

    const loadAddresses = async () => {
        setLoading(true);
        const result = await getAllAddresses();
        if (result.success) setAddresses(Array.isArray(result.data) ? result.data : []);
        setLoading(false);
    };

    const loadProvinces = async () => {
        const result = await getAllProvinces();
        if (result.success) setProvinces(Array.isArray(result.data) ? result.data : []);
    };

    const loadWards = async (provinceCode, keepWardCode = "") => {
        if (!provinceCode) { setWards([]); return; }
        setLoadingWards(true);
        const result = await getWardsByProvinceCode(provinceCode);
        if (result.success) {
            setWards(Array.isArray(result.data) ? result.data : []);
            if (keepWardCode) setFormData(prev => ({...prev, wardCode: keepWardCode}));
        }
        setLoadingWards(false);
    };

    useEffect(() => {
        if (isOpen) { loadAddresses(); loadProvinces(); setShowForm(false); setEditingId(null); resetForm(); }
    }, [isOpen]);

    const handleProvinceChange = (province) => {
        const code = getProvinceCode(province);
        setFormData(prev => ({...prev, provinceCode: code, wardCode: ""}));
        loadWards(code);
    };

    const handleWardChange = (ward) => setFormData(prev => ({...prev, wardCode: getWardCode(ward)}));
    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleAddNew = () => { setShowForm(true); setEditingId(null); resetForm(); };
    const handleEdit = (address) => {
        setShowForm(true);
        setEditingId(address.id);
        setFormData({ label: address.label || "", address: address.address || "", provinceCode: address.provinceCode || "", wardCode: address.wardCode || "", isDefault: !!address.isDefault });
        if (address.provinceCode) loadWards(address.provinceCode, address.wardCode);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = editingId ? await updateAddress(editingId, formData) : await createAddress(formData);
        if (result.success) {
            triggerToast("success", "Saved successfully");
            await loadAddresses();
            setShowForm(false);
        } else triggerToast("error", result.message);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this address?")) return;
        const result = await deleteAddress(id);
        if (result.success) { triggerToast("success", "Deleted"); loadAddresses(); }
        else triggerToast("error", "Delete failed");
    };

    const handleSetDefault = async (id) => {
        const result = await setDefaultAddress(id);
        if (result.success) { triggerToast("success", "Default updated"); loadAddresses(); }
    };

    const handleUseAddress = (address) => {
        if (!address) return;
        onSelectAddress?.(address);
        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay address-modal-overlay" onClick={onClose}>
            <div className="address-management-modal" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="modal-header__text">
                        <h2>Address Management</h2>
                        <p>Manage your saved shipping addresses for faster checkout.</p>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose}>×</button>
                </header>

                {/* Grid container: Class 'has-form' quyết định chia 1 hay 2 cột */}
                <div className={`address-management-grid ${showForm ? "has-form" : "list-only"}`}>
                    <section className="panel panel--addresses">
                        <div className="panel__header">
                            <div>
                                <h3>Your Addresses</h3>
                                <span className="panel__subtitle">Manage your saved locations.</span>
                            </div>
                            {!showForm && (
                                <button type="button" className="btn-add-new" onClick={handleAddNew}>
                                    + Add New
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="loading-card">Loading...</div>
                        ) : addresses.length === 0 ? (
                            <div className="empty-state">
                                <h3>No addresses yet</h3>
                                <button type="button" className="btn-add-first" onClick={handleAddNew}>Add your first address</button>
                            </div>
                        ) : (
                            <div className="addresses-list">
                                {addresses.map((address) => (
                                    <article key={address.id} className={`address-card ${address.isDefault ? "default" : ""}`}>
                                        <div className="address-card__top">
                                            <div className="address-card__badge-row">
                                                {address.label && <span className="address-label">{address.label}</span>}
                                                {address.isDefault ? (
                                                    <span className="default-badge">Default</span>
                                                ) : (
                                                    <span className="default-badge default-badge--placeholder" aria-hidden="true">Default</span>
                                                )}
                                            </div>
                                            <div className="address-card__detail">{address.address}</div>
                                            <div className="address-card__location">{address.wardName}, {address.provinceName}</div>
                                        </div>
                                        <div className={`address-actions ${selectionMode ? "is-selection" : "is-profile"}`}>
                                            {selectionMode && (
                                                <button type="button" className="btn-use" onClick={() => handleUseAddress(address)}>Use</button>
                                            )}

                                            <button
                                                type="button"
                                                className={`btn-set-default ${address.isDefault ? "is-default" : ""}`}
                                                onClick={() => !address.isDefault && handleSetDefault(address.id)}
                                                disabled={address.isDefault}
                                            >
                                                {address.isDefault ? "Default" : "Set Default"}
                                            </button>
                                            <button type="button" className="btn-edit" onClick={() => handleEdit(address)}>Edit</button>
                                            <button type="button" className="btn-delete" onClick={() => handleDelete(address.id)}>Delete</button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Editor Section: CHỈ hiển thị khi showForm = true */}
                    {showForm && (
                        <section className="panel panel--editor">
                            <form className="address-form" onSubmit={handleSubmit}>
                                <div className="form-title-block">
                                    <p className="form-kicker">{editingId ? "Edit" : "New"} address</p>
                                    <h3>Shipping details</h3>
                                </div>
                                <div className="form-group">
                                    <label>Label</label>
                                    <input type="text" name="label" value={formData.label} onChange={handleInputChange} placeholder="Home, Office..." />
                                </div>
                                <div className="form-row">
                                    <InlineSearchDropdown label="Province" required value={formData.provinceCode} options={provinces} onChange={handleProvinceChange} getOptionValue={getProvinceCode} getOptionLabel={p => p?.name || getProvinceCode(p)} getOptionSearchText={p => p?.name || ""} />
                                    <InlineSearchDropdown label="Ward" required value={formData.wardCode} options={wards} disabled={!formData.provinceCode || loadingWards} onChange={handleWardChange} getOptionValue={getWardCode} getOptionLabel={w => w?.name || getWardCode(w)} getOptionSearchText={w => w?.name || ""} />
                                </div>
                                <div className="form-group">
                                    <label>Detailed Address <span className="required">*</span></label>
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Street, Building..." required />
                                </div>
                                <div className="form-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-submit">Save Address</button>
                                </div>
                            </form>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressManagement;