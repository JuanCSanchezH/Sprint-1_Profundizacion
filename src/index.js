import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
import './helpers/chat&emojis.js'
import './styles/css/template.css'
import './helpers/search&showMessages.js'

import {get, create} from './script/api.js';
const BASE_URL = "http://localhost:3000"
let myConversation = null;

const userLogged = JSON.parse(localStorage.getItem('user'));

//Función para listar las conversaciones de la persona logueada

async function listConversations(arr) {
    //ya tengo que recibir el arreglo filtrado con los participantes que incluyan mi id
    let html = "";
    let user = null;
    for(let index = 0; index < arr.length; index++){
        // participantes: [idDelOtro, idMio]
        try {
            user = await get(`${BASE_URL}/users/${arr[index].participantes[0]}`);
        } catch(e) {
            console.log('error', e)
        }
        if(userLogged[0].name != user.name){
            html += `
                <div class="main__leftSide__chatList__chat" onclick="getConversationId(${user.id})">
                    <figure class="main__leftSide__chatList__chat--fig">
                        <img src="${user.image}" width="100%" alt="">
                    </figure>
                    <div class="main__leftSide__chatList__chat__info">
                        <div class="main__leftSide__chatList__chat__info--sup">
                            <p id="friend-name">${user.name}</p>
                        </div>
                        <div class="main__leftSide__chatList__chat__info--msg">
                            <figure><img src="https://res.cloudinary.com/di90urdxw/image/upload/v1693068101/double-tick_2_vanjau.png" width="100%" alt=""></figure>
                            <p>lorem ipsum</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    const container = document.getElementsByClassName("main__leftSide__chatList");
    container[0].innerHTML = html;
}

// Función para obtener todas las conversaciones de la persona que está logueada

async function getMyConversations() {
    try {
        const myConversations = await get(`${BASE_URL}/conversaciones?participantes_contains=${userLogged[0].id}`);
        // myLastMsgs = await get(`${BASE_URL}/mensajes`);
        // const conversationsWithUser = myConversations.filter(conversation => {
        //     return conversation.participantes.includes(userLogged[0].id);
        // });
    
        // if (conversationsWithUser.length > 0) {
        //     const lastUserConversation = conversationsWithUser[conversationsWithUser.length - 1];
        //     localStorage.removeItem("lastConversation");
        //     localStorage.setItem('lastConversation', JSON.stringify(lastUserConversation));
        // }
        listConversations(myConversations);
    } catch(e){
        console.log("error", e);
    }
}

//Función para crear conversación entre la persona logueada y la persona seleccionada dentro de la lista de conversaciones

window.createConversation = async function createConversation(id){
    try {
        await create(`${BASE_URL}/conversaciones`, {participantes: [id, userLogged[0].id]});
        getMyConversations()
    } catch(e) {
        console.log(e);
    }
} 

// window.filterConv = function filterConv(){
    
// }

window.getUsers = async function getUsers() {
    try {
        const users = await get(`${BASE_URL}/users`);
        console.log("users", users);
        return users;
    } catch(e) {
        console.log(e);
    }
}

window.openUserList = function openUserList() {
    console.log("entré al open user list");
    getUsers().then((result) => {
        console.log("second result", result);
        let html = "";
        result.forEach( item => {
        html += `
            <div class="main__leftSide__chatList__chat" onclick="createConversation(${item.id})">
                <figure class="main__leftSide__chatList__chat--fig">
                    <img src="${item.image}" width="100%" alt="">
                </figure>
                <div class="main__leftSide__chatList__chat__info">
                    <div class="main__leftSide__chatList__chat__info--sup">
                        <p id="friend-name">${item.name}</p>
                    </div>
                </div>
            </div>
        `;
        })
        const container = document.getElementsByClassName("main__leftSide__chatList");
        container[0].innerHTML = html;
    })
}

window.sendMessage = async function sendMessage(){
    const sentMessage = document.getElementById("inputSendMessage").value;
    console.log(myConversation.participantes[0]);
    // const usuarioId = myConversation[0].participantes[0];
    const usuarioId = userLogged[0].id;
    const conversacionId = myConversation.id;
    const fecha = new Date();
    const message = {
        conversacionId: conversacionId,
        usuarioId: usuarioId,
        contenido: sentMessage,
        fecha: fecha,
    }
    
    console.log(message);
    await create(`${BASE_URL}/mensajes`, message);
    await displayMessage();
    document.getElementById("inputSendMessage").value = '';
}

window.displayMessage = async function displayMessage(){
    const messageArray = await get(`${BASE_URL}/mensajes`);
    let html = "";
    console.log(myConversation);
    messageArray.forEach( item => {
        // console.log( 'El otro usuario: ', item.usuarioId, 'Usuario logueado: ', userLogged[0].id);
        // html += `
        // <div class="message sent">
        //     <div class="message-content">
        //         <p>${item.contenido}</p>
        //         <span class="timestamp">${item.fecha}</span>
        //     </div>
        // </div>
        // `;
        
        if(item.conversacionId == myConversation.id){
            // console.log(item.conversacionId, myConversation.id);
            if (item.usuarioId == myConversation.participantes[1]){
                html += `
                <div class="message sent">
                    <div class="message-content">
                        <p>${item.contenido}</p>
                        <span class="timestamp">${item.fecha}</span>
                    </div>
                </div>
                `;
            }else {
                html += `
                <div class="message recieved">
                    <div class="message-content">
                        <p>${item.contenido}</p>
                        <span class="timestamp">${item.fecha}</span>
                    </div>
                </div>
                `;
            }
        }
        
    })
    const container = document.getElementById("chat");
    container.innerHTML = html;
    console.log("Estamos en display message");
}

window.getConversationId = async function getConversationId(ID){
    document.getElementById("chat").value = '';
    document.getElementById("offcanvasRightLabel");
    ID = typeof ID !== 'undefined' ? ID : 1;
    // console.log(ID);
    try {
        if(ID){
            myConversation = await get(`${BASE_URL}/conversaciones?participantes_like=${ID}`);
            myConversation = myConversation[0];
            localStorage.removeItem("lastConversation");
            localStorage.setItem('lastConversation', JSON.stringify(myConversation));
            console.log('Conversación seleccionada: ', myConversation);
        }else{
            const lastConversation = JSON.parse(localStorage.getItem('lastConversation'));
            if (lastConversation) {
                myConversation = lastConversation;
                localStorage.setItem('lastConversation', JSON.stringify(myConversation));
                console.log('Conversación seleccionada: ', myConversation);
            }
        }
        await displayMessage();
    } catch(e){
        console.log("error", e);
    }
}

getMyConversations();
// getConversationId();
displayMessage();
// export const conversation = myConversation;