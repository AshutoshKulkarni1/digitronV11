import { Card, Button, StatusLabel, StarRating, Tooltip, Icon } from "../ui";

export default function ProductCard({ 
  product, 
  onView, 
  compareList = [], 
  onCompare, 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted = false 
}) {
  const isSelected = compareList.some((p) => p.id === product.id);
  const priceLabel = product.price > 0 ? `₹${product.price.toLocaleString("en-IN")}` : "Price on request";

  const handleCompare = (e) => {
    e.stopPropagation();
    onCompare(product);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    onToggleWishlist?.(product);
  };

  const handleCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <Card 
      className="product-card" 
      interactive 
      onClick={() => onView(product)}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}
    >
      {/* Image Area */}
      <div 
        className="card-img-wrap" 
        style={{ 
          backgroundColor: "var(--color-ice)", 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          overflow: "hidden",
          position: "relative",
          height: "190px",
          width: "100%"
        }}
      >
        {product.images && product.images[0] && product.images[0] !== "product" ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="product-card-img" 
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: "16px" }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--color-muted)' }}>
            <Icon name={product.category === "Cameras" ? "camera" : "package"} size={32} />
            <span className="meta-style" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{product.category}</span>
          </div>
        )}
        
        {/* Floating overlay actions: Compare & Wishlist */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 5 }}>
          <Tooltip content={isSelected ? "Remove comparison" : "Add to compare"}>
            <button
              type="button"
              className={`card-compare-btn ${isSelected ? "selected" : ""}`}
              onClick={handleCompare}
              aria-label="Compare"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isSelected ? 'var(--color-surface)' : 'var(--color-ink)',
                backgroundColor: isSelected ? 'var(--brand)' : 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <Icon name={isSelected ? "check" : "plus"} size={13} />
            </button>
          </Tooltip>
          
          {onToggleWishlist && (
            <Tooltip content={isWishlisted ? "Remove wishlist" : "Save to wishlist"}>
              <button
                type="button"
                className={`card-wishlist-btn ${isWishlisted ? "selected" : ""}`}
                onClick={handleWishlist}
                aria-label="Save to wishlist"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isWishlisted ? 'var(--color-surface)' : 'var(--color-ink)',
                  backgroundColor: isWishlisted ? 'var(--color-danger)' : 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <Icon name="heart" size={13} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Card Content Details */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Brand label */}
        <span className="meta-style" style={{ textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>
          {product.brand}
        </span>

        {/* Product title */}
        <h3 
          className="h3-style" 
          style={{ 
            margin: '0 0 8px 0', 
            whiteSpace: 'nowrap', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            display: 'block'
          }} 
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Rating + stock level in one row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <StarRating rating={product.avg_rating} />
            <span className="meta-style" style={{ fontSize: '11px', display: 'inline' }}>({product.review_count})</span>
          </div>
          <StatusLabel text={product.stock || "Out of Stock"} />
        </div>

        {/* Price + Button row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: 'auto', width: '100%' }}>
          <span className="price-style" style={{ fontSize: '16px', fontWeight: 800 }}>
            {priceLabel}
          </span>
          {onAddToCart ? (
            <Button 
              variant="primary" 
              onClick={handleCart}
              style={{ padding: '8px 16px', fontSize: '12.5px', height: '36px', borderRadius: '999px', background: 'var(--brand)' }}
            >
              Get Quote
            </Button>
          ) : (
            <Button 
              variant="secondary" 
              onClick={() => onView(product)}
              style={{ padding: '8px 16px', fontSize: '12.5px', height: '36px', borderRadius: '999px' }}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
