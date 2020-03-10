import axios from 'axios';

const instance = axios.create({
	baseURL : 'https://the-burger-builder-57300.firebaseio.com/'
});

export default instance;
