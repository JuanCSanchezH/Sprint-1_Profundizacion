import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/css/signUp.css'
import '../node_modules/sweetalert2/dist/sweetalert2.min.css'
import {create, get} from './script/api.js'

const USERS_ENPOINT = 'http://localhost:3000/users';

window.catchingData = async function catchingData() {  //Se le asigna al objeto window para que el onclick pueda acceder a la información
	
    const phone = document.getElementById('phone').value;

	const users = await get(USERS_ENPOINT);
	const foundUser = users.find(user => user.phone == phone) 
	if(!foundUser){
		const name = document.getElementById('name').value;
		const password = document.getElementById('password').value;
		const image = document.getElementById('image').value;
		const info = document.getElementById('secondary-info').value;
		
		const element = {
			name: name,
			phone: phone,
			password: password,
			image: image,
			flag: false,
			info: info,
			dateHour: ""
		}

		await create(element, USERS_ENPOINT);

		Swal.fire({
			title: 'Nice!',
			text: 'Welcome to AlienVerse',
			icon: 'success',
			confirmButtonText: 'Cool'
		})
	}

	Swal.fire({
		title: 'Ups!',
		text: 'Your number phone is already registered',
		icon: 'error',
		confirmButtonText: 'Cool'
	})
}

