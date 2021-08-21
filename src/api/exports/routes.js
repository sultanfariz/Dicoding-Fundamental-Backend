const routes = (handler) => [
    {
        method: 'POST',
        path: '/export/playlists',
        handler: handler.postExportPlaylistsHandler,
        options: {
            auth: 'openmusic_jwt',
        },
    },
];

module.exports = routes;