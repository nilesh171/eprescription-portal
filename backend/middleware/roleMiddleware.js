const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.userData || !roles.includes(req.userData.role)) {
            return res.status(403).json({ message: 'Access forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = checkRole;
