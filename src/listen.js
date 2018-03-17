'use strict'

import finalhandler from 'finalhandler'

export default function Listen() {
	const {opts, router, server} = this
	server
		.listen(opts.port, () => {
			let info = {
				port: opts.port,
				router,
				server,
			}
			opts.created && opts.created.bind(info)(info)
		})
		.on('request', (req, res) => {
			router(req, res, finalhandler(req, res))
		})
}