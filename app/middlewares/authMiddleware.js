const { getPayloadToken } = require('../middlewares/manageToken');

const auth = (roles = []) => {
  return (req, res, next) => {
    if (typeof roles === 'number') {
      roles = [roles];
    }
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: req.t('auth.notLoggedIn') });
    }

    try {
      const decoded = getPayloadToken(token);
      req.user = decoded;

      if (roles.length && !roles.includes(req.user.role)) {
        // Vai trò không được phép
        return res.status(403).json({ message: req.t('auth.forbidden') });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: req.t('auth.invalidToken') });
    }
  };
};

module.exports = auth;
