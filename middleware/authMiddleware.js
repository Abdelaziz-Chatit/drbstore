// Authentication and Authorization Middleware

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Check if user is admin (ROLE_ADMIN required)
const isAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const roles = req.session.user.roles || [];
  if (!roles.includes('ROLE_ADMIN')) {
    return res.status(403).render('error', { message: 'Admin access required. Only administrators can access this page.' });
  }
  next();
};

// Check if user is manager only (ROLE_RESPONSABLE without ROLE_ADMIN)
const isManager = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const roles = req.session.user.roles || [];
  if (!roles.includes('ROLE_RESPONSABLE') || roles.includes('ROLE_ADMIN')) {
    return res.status(403).render('error', { message: 'Manager access required.' });
  }
  next();
};

// Check if user is admin or manager (ROLE_ADMIN or ROLE_RESPONSABLE)
const isAdminOrManager = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  const roles = req.session.user.roles || [];
  if (!roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_RESPONSABLE')) {
    return res.status(403).render('error', { message: 'Admin or Manager access required.' });
  }
  next();
};

// Check if user has specific role
const hasRole = (role) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    const roles = req.session.user.roles || [];
    if (!roles.includes(role)) {
      return res.status(403).render('error', { message: `Access denied. ${role} access required.` });
    }
    next();
  };
};

// Check if user has any of the specified roles
const hasAnyRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }
    const userRoles = req.session.user.roles || [];
    const hasAccess = rolesArray.some(role => userRoles.includes(role));
    if (!hasAccess) {
      return res.status(403).render('error', { message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isManager,
  isAdminOrManager,
  hasRole,
  hasAnyRole
};
