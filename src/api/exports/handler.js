const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
	constructor(ProducerService, playlistsService, validator) {
		this._ProducerService = ProducerService;
		this._playlistsService = playlistsService;
		this._validator = validator;

		this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
	}

	async postExportPlaylistsHandler(request, h) {
		try {
			this._validator.validateExportPlaylistsPayload(request.payload);
			const { id: userId } = request.auth.credentials;
			const { playlistId } = request.params;

			await this._playlistsService.verifyPlaylistAccess(playlistId, userId);

			const message = {
				userId: userId,
				playlistId,
				targetEmail: request.payload.targetEmail,
			};
			await this._ProducerService.sendMessage(JSON.stringify(message), 'export:playlists');

			const response = h.response({
				status: 'success',
				message: 'Permintaan Anda sedang kami proses',
			});
			response.code(201);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			// Server ERROR!
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kesalahan pada server kami',
			});
			response.code(500);
			console.error(error);
			return response;
		}
	}
}

module.exports = ExportsHandler;