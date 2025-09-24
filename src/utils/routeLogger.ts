
// src/utils/routeLogger.ts

import { Router } from 'express';

export function logRoutes(basePath: string, router: Router) {
    const uniqueRoutes = new Set<string>();

    router.stack.forEach(layer => {
        if (layer.route) {
            // Combine base path with route path
            const path = basePath + layer.route.path;
            // Normalize path by removing any trailing slash, unless it's the root path '/'
            const normalizedPath = path.length > 1 ? path.replace(/\/$/, '') : path;
            uniqueRoutes.add(normalizedPath);
        }
    });

    uniqueRoutes.forEach(route => {
        console.log(`[Route Loader] Registering route: ${route}`);
    });
}
