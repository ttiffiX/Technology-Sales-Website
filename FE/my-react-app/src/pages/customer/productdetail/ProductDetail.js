import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.scss';
import Nav from "../../../components/navigation/Nav";
import Header from "../../../components/header/Header";
import { getProductDetail } from "../../../api/customer/ProductAPI";
import { addCartItem } from "../../../api/customer/CartAPI";
import { useToast } from "../../../components/Toast/Toast";
import { isAuthenticated, getCurrentUser } from "../../../api/AuthAPI";
import {formatPrice, formatProductAttributeValue, getImage, normalizePageResponse} from "../../../utils";
import WriteReviewModal from "../../../components/modal/review/WriteReviewModal";
import ProductReviewAPI from "../../../api/customer/ProductReviewAPI";
import { StarDisplay, formatAverage, percentForCount } from "../../../utils/reviewUtils";
import {useCart} from "../../../contexts/CartContext";
import PaginationControls from "../../../components/pagination/PaginationControls";

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { triggerToast } = useToast();
    const { cartCount, incrementCartCount, refreshCartCount } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [addingToCart, setAddingToCart] = useState(false);
    const [reviewSummary, setReviewSummary] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewFilter, setReviewFilter] = useState(null); // null = all, or 5..1
    const [reviewPage, setReviewPage] = useState(0);
    const [reviewSize, setReviewSize] = useState(10);
    const [reviewTotalPages, setReviewTotalPages] = useState(0);
    const [reviewTotalElements, setReviewTotalElements] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editInitialData, setEditInitialData] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const reviewRef = useRef(null);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await getProductDetail(id);
                setProduct(data);
                // fetch reviews summary/list after product loaded
                try {
                    const summary = await ProductReviewAPI.getProductReviewStars(id);
                    setReviewSummary(summary);
                } catch (e) {
                    // ignore summary errors for now
                    console.warn('Failed to fetch review summary', e);
                }
                try {
                    // load initial review list using paging params
                    await loadReviews(0, reviewSize, null);
                } catch (e) {
                    console.warn('Failed to fetch reviews', e);
                }
            } catch (err) {
                setError(err.response?.data || 'Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // load reviews helper
    const loadReviews = async (page = reviewPage, size = reviewSize, rating = reviewFilter) => {
        if (!product && !id) return;
        setLoadingReviews(true);
        try {
            const list = await ProductReviewAPI.getProductReviews(id || product?.id, page, size, rating);
            const pageData = normalizePageResponse(list);
            setReviews(pageData.content || []);
            setReviewPage(Number.isFinite(pageData.pageNumber) ? pageData.pageNumber : 0);
            setReviewTotalPages(Number.isFinite(pageData.totalPages) ? pageData.totalPages : 0);
            setReviewTotalElements(Number.isFinite(pageData.totalElements) ? pageData.totalElements : 0);
            if (Number.isFinite(pageData.pageSize)) {
                setReviewSize(pageData.pageSize);
            }
        } catch (e) {
            console.error('loadReviews error', e);
            setReviews([]);
            setReviewTotalPages(0);
            setReviewTotalElements(0);
        } finally {
            setLoadingReviews(false);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        // Check if user is logged in
        if (!isAuthenticated()) {
            triggerToast('error', 'Please login to add items to cart');
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        try {
            // Add to cart
            const response = await addCartItem(product.id);
            triggerToast('success', response || 'Added to cart successfully');

            // Optimistic update: increment cart count immediately
            incrementCartCount();

            // Refresh cart count in background to ensure sync
            refreshCartCount();
        } catch (err) {
            console.error('Error adding to cart:', err);
            triggerToast('error', err || 'Failed to add to cart');

            // If error, refresh to get correct count
            refreshCartCount();
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="MyApp">
                <Nav count={cartCount} />
                <Header title="Product Detail" modeDisplay="normal" />
                <div className="product-detail-container">
                    <div className="loading">Loading product detail...</div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="MyApp">
                <Nav count={cartCount} />
                <Header title="Product Detail" modeDisplay="normal" />
                <div className="product-detail-container">
                    <div className="error">{error || 'Product not found'}</div>
                    <button onClick={handleBack} className="back-btn">Back to Products</button>
                </div>
            </div>
        );
    }

    return (
        <div className="MyApp">
            <Nav count={cartCount} />
            <Header title="Product Detail" modeDisplay="normal" />

            <div className="product-detail-container">
                <button onClick={handleBack} className="back-btn">
                    ← Back
                </button>

                <div className="product-detail-content">
                    {/* Left side - Image */}
                    <div className="product-image-section">
                            {/*<div className="product-image">*/}
                            {/*    {product.imageUrl ? (*/}
                            {/*        <img src={product.imageUrl} alt={product.title} />*/}
                            {/*    ) : (*/}
                            {/*        <div className="no-image">No Image</div>*/}
                            {/*    )}*/}
                            {/*</div>*/}
                        <div className="product-image" style={{backgroundImage: `url(${getImage(product.imageUrl)})`}}></div>
                          <div className="product-meta-row">
                              {product.categoryName && (
                                  <div className="category-tag">{product.categoryName}</div>
                              )}
                              {/* clickable summary: scroll to reviews - next to category */}
                                <div className="product-review-summary-clickable" onClick={() => reviewRef.current && reviewRef.current.scrollIntoView({behavior: 'smooth'})} style={{cursor: 'pointer'}}>
                                    {reviewSummary ? (
                                        <div className="summary-inline">
                                            <strong style={{marginRight:4}}>{formatAverage(reviewSummary.averageRating)}</strong>
                                            <span style={{color: '#f5a623', fontSize: '14px'}}>★</span>
                                            <span style={{marginLeft:4, color:'#666', fontSize: '12px'}}>({reviewSummary.totalReviewCount ?? 0})</span>
                                        </div>
                                    ) : (
                                        <div className="summary-inline" style={{fontSize: '12px', color: '#999'}}>No reviews yet.</div>
                                    )}
                                </div>
                          </div>
                    </div>

                    {/* Right side - Details */}
                    <div className="product-info-section">
                        <h1 className="product-title">{product.title}</h1>

                        <div className="product-price-section">
                            <span className="product-price">
                                {formatPrice(product.price)}
                            </span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="product-description">
                                <h3>Description</h3>
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <div className="product-specifications">
                                <h3>Specifications</h3>
                                {Object.entries(product.attributes).map(([groupOrder, group]) => (
                                    <div key={groupOrder} className="spec-group">
                                        <h4 className="spec-group-name">{group.groupName}</h4>
                                        <table className="specs-table">
                                            <tbody>
                                                {group.filterAttributes?.map((attr, idx) => (
                                                    <tr key={idx}>
                                                        <td className="spec-label">{attr.attributeName}</td>
                                                        <td className="spec-value">
                                                            {formatProductAttributeValue(attr.availableValues)}
                                                            {attr.unit ? ` ${attr.unit}` : ''}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Action Buttons */}
                         <div className="product-actions">
                             <button
                                 className="add-to-cart-btn"
                                 onClick={handleAddToCart}
                                 disabled={addingToCart}
                             >
                                 {addingToCart ? 'Adding...' : 'Add to Cart'}
                             </button>
                         </div>
                    </div>
                </div>
            </div>
              {/* Reviews section - unified container with stats and comments */}
              {product && (
              <div className="product-reviews-section">
                  <div ref={reviewRef} className="product-reviews-container">
                      <h2 className="reviews-main-title">Reviews <span className="product-name-in-review">- {product.title}</span></h2>

                      {/* Reviews stats section: stars + distribution in one frame */}
                      <div className="reviews-stats-container">
                          <div className="review-stats-panel">
                              <div className="review-left">
                                  <div className="avg-score">{formatAverage(reviewSummary?.averageRating || 0)}<span>/5</span></div>
                                  <StarDisplay rating={reviewSummary?.averageRating || 0} />
                                  <div className="review-count">{reviewSummary?.totalReviewCount ?? 0} rating(s)</div>
                                  <button className="write-review-btn" onClick={() => setShowWriteModal(true)}>Write a Review</button>
                              </div>
                              <div className="review-right">
                                  {[5,4,3,2,1].map(n => (
                                      <div key={n} className="rating-bar-row">
                                          <div className="rating-label">{n} ★</div>
                                          <div className="rating-bar-container">
                                              <div className="rating-bar-fill" style={{width: `${percentForCount(reviewSummary?.ratingCounts?.[n] ?? 0, reviewSummary?.totalReviewCount ?? 0)}%`}} />
                                          </div>
                                          <div className="rating-count">{reviewSummary?.ratingCounts?.[n] ?? 0}</div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Comments section in frame - filter moved inside */}
                      <div className="reviews-comments-container">
                          {/* Filter tabs inside comments container */}
                           <div className="review-filter-tabs">
                               <button className={`filter-tab ${reviewFilter === null ? 'active' : ''}`} onClick={async () => {
                                   setReviewFilter(null);
                                   // reset to first page when filter changes
                                   await loadReviews(0, reviewSize, null);
                               }}>All</button>
                               {[5,4,3,2,1].map(n => (
                                   <button key={n} className={`filter-tab ${reviewFilter === n ? 'active' : ''}`} onClick={async () => {
                                       setReviewFilter(n);
                                       await loadReviews(0, reviewSize, n);
                                   }}>{n} star</button>
                               ))}
                           </div>
                          {loadingReviews ? (
                              <div className="reviews-loading">Loading reviews...</div>
                          ) : reviews.length === 0 ? (
                              <div className="reviews-empty">No comments yet</div>
                          ) : (
                              <div className="reviews-items">
                                  {reviews.map((r) => {
                                      const currentUser = getCurrentUser();
                                      const isMine = currentUser?.username && (currentUser.username === r.userName);
                                      return (
                                           <div key={r.id}>
                                              <div className="review-item">
                                                  <div className="review-header">
                                                      <div className="review-user-info">
                                                          <strong>{r.userRealName}</strong>
                                                          {isMine && <span className="you-badge">You</span>}
                                                          <span className="rating">{r.rating} ★</span>
                                                      </div>
                                                      <div className="review-actions">
                                                           <span className="time">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                          {isMine && <button className="review-menu-btn" onClick={() => setActiveMenuId(activeMenuId === r.id ? null : r.id)}>⋯</button>}
                                                          {isMine && activeMenuId === r.id && (
                                                               <div className="review-menu">
                                                                   <>
                                                                       <button onClick={() => {
                                                                           setEditingReviewId(r.id);
                                                                           setEditInitialData({ rating: r.rating, comment: r.comment });
                                                                           setShowWriteModal(true);
                                                                           setActiveMenuId(null);
                                                                       }}>Edit</button>
                                                                          <button onClick={async () => {
                                                                              if (!window.confirm('Are you sure you want to delete this review?')) return;
                                                                               try {
                                                                                   await ProductReviewAPI.deleteProductReview(r.id);
                                                                                   triggerToast('success','Review deleted successfully');
                                                                                   await loadReviews(reviewPage, reviewSize, reviewFilter);
                                                                                   const summary = await ProductReviewAPI.getProductReviewStars(product.id);
                                                                                   setReviewSummary(summary);
                                                                               } catch (e) {
                                                                                  console.error(e);
                                                                                  const errorMsg = typeof e?.response?.data === 'string'
                                                                                      ? e.response.data
                                                                                      : (e?.response?.data?.message || e?.message || 'Failed to delete review');
                                                                                  triggerToast('error', errorMsg);
                                                                              }
                                                                           }}>Delete</button>
                                                                       </>
                                                                   </div>
                                                          )}
                                                      </div>
                                                  </div>
                                                  <div className="review-comment">{r.comment}</div>
                                                  {r.replies && r.replies.length > 0 && (
                                                      <div className="review-replies">
                                                          {r.replies.map(rep => (
                                                               <div key={rep.id} className="reply-item">
                                                                   <div className="reply-header">
                                                                       <strong className="reply-user">{rep.userName}</strong>
                                                                       <span className="reply-role-badge">{rep.userRole}</span>
                                                                        <span className="reply-time">{new Date(rep.createdAt).toLocaleDateString()}</span>
                                                                   </div>
                                                                   <div className="reply-comment">{rep.comment}</div>
                                                               </div>
                                                          ))}
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          )}

                           <PaginationControls
                               page={reviewPage}
                               totalPages={reviewTotalPages}
                               totalElements={reviewTotalElements}
                               onPageChange={(nextPage) => loadReviews(nextPage, reviewSize, reviewFilter)}
                               disabled={loadingReviews}
                           />
                      </div>

                      <WriteReviewModal
                          isOpen={showWriteModal}
                          onClose={() => { setShowWriteModal(false); setEditingReviewId(null); setEditInitialData(null); }}
                          productTitle={product?.title || 'Product'}
                          submitting={submittingReview}
                          initialData={editInitialData}
                          onSubmit={async (payload) => {
                              if (!product) return;
                              setSubmittingReview(true);
                              try {
                                   if (editingReviewId) {
                                       await ProductReviewAPI.updateProductReview(editingReviewId, payload);
                                       triggerToast('success', 'Review updated successfully');
                                   } else {
                                       await ProductReviewAPI.submitProductReview(product.id, payload);
                                       triggerToast('success', 'Review submitted successfully');
                                   }
                                   const summary = await ProductReviewAPI.getProductReviewStars(product.id);
                                   setReviewSummary(summary);
                                   // reload current page (or first page after submit)
                                   await loadReviews(0, reviewSize, reviewFilter);
                                  setShowWriteModal(false);
                                  setEditingReviewId(null);
                                  setEditInitialData(null);
                              } catch (e) {
                                  console.error(e);
                                  const errorMsg = typeof e?.response?.data === 'string'
                                      ? e.response.data
                                      : (e?.response?.data?.message || e?.message || 'Failed to submit/update review');
                                  triggerToast('error', errorMsg);
                              } finally {
                                  setSubmittingReview(false);
                              }
                          }}
                      />
                  </div>
              </div>
              )}
        </div>
    );
}

export default ProductDetail;

