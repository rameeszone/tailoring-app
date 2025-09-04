export interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data: T;
	meta?: {
		timestamp: string;
		version: string;
		requestId: string;
	};
}
