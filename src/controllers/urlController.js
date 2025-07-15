import * as urlService from '../services/urlService.js';

export const getToken = (req, res) => {
    urlService.getToken(req, res);
};

export const createShortUrl = (req, res) => {
    urlService.createShortUrl(req, res);
};

export const getStats = (req, res) => {
    urlService.getStats(req, res);
};

export const redirectShortUrl = (req, res) => {
    urlService.redirectShortUrl(req, res);
}; 