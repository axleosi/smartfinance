
export function checkNotPartner(req, res, next) {
  if (req.user?.role === 'partner' || req.user?.role === 'admin') {
    return res.status(400).json({
      message: 'You are already a partner. You cannot request a new promo code.'
    });
  }
  next();
}
