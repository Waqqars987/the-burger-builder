import { useEffect, useState } from 'react';

export default httpClient => {
	const [ error, setError ] = useState(null);

	// alternative for componentWillMount()
	const reqInterceptor = httpClient.interceptors.request.use(req => {
		setError(null);
		return req;
	});

	const resInterceptor = httpClient.interceptors.response.use(
		res => res,
		err => {
			setError(err);
		}
	);

	// alternative for componentWillUnmount()
	useEffect(
		() => {
			return () => {
				httpClient.interceptors.request.eject(reqInterceptor);
				httpClient.interceptors.request.eject(resInterceptor);
			};
		},
		[ reqInterceptor, resInterceptor ] // also cleanup when the interceptors changes
	);

	const errorConfirmedHandler = () => {
		setError(null);
	};

	return [ error, errorConfirmedHandler ];
};
