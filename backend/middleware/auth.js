import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware de protection des routes — vérifie le JWT et le rôle
export const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      let token;

      // Extraction du token depuis le header Authorization ou les cookies
      if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      } else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({ message: 'Accès non autorisé. Veuillez vous connecter.' });
      }

      // Vérification du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur introuvable.' });
      }

      // Vérification du rôle si spécifié
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Accès interdit. Permissions insuffisantes.' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
  };
};
