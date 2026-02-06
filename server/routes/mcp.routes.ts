import { Router } from 'express';
import * as mcpController from '../controllers/mcp.controller.js';
import * as oauth2Controller from '../controllers/oauth2.controller.js';

export const router = Router();

// Server management routes
router.post('/servers', mcpController.createServer);
router.get('/servers', mcpController.listServers);
router.get('/servers/:id', mcpController.getServer);
router.put('/servers/:id', mcpController.updateServer);
router.delete('/servers/:id', mcpController.deleteServer);

// Server operations
router.post('/servers/:id/test', mcpController.testConnection);
router.post('/servers/:id/sync', mcpController.syncTools);
router.patch('/servers/:id/toggle', mcpController.toggleServer);

// Tool routes
router.get('/tools', mcpController.listTools);
router.post('/tools/execute', mcpController.executeTool);

// OAuth2 routes
router.post('/oauth2/discover/:serverId', oauth2Controller.discoverOAuth2);
router.get('/oauth2/authorize/:serverId', oauth2Controller.initiateAuthorization);
router.get('/oauth2/callback', oauth2Controller.handleCallback);
router.post('/oauth2/revoke/:serverId', oauth2Controller.revokeAuthorization);
router.get('/oauth2/status/:serverId', oauth2Controller.getAuthorizationStatus);
