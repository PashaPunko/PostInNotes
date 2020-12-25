changeSize = false;
changePosition = false;
changedItem = null;
curX = null;
curY = null;


const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("/Notes")
    .build();
hubConnection.serverTimeoutInMilliseconds = 1000 * 60 * 10;
hubConnection.on('RenderNotes', function (notes) {
    mainContainer = document.getElementById('content');
    notes.forEach(note => {
        newNote = createNote(note);
        mainContainer.appendChild(newNote);
    })
});
hubConnection.on('AddNote', function (note) {
    mainContainer = document.getElementById('content');
    newNote = createNote(note);
    mainContainer.insertBefore(newNote, mainContainer.firstChild);
});
hubConnection.on('UpdateText', function (note) {
    updtedNote = document.getElementById(note.id);
    updtedNote.children[1].innerHTML = markdown.toHTML(note.text);
});
hubConnection.on('UpdateColor', function (note) {
    updtedNote = document.getElementById(note.id);
    updtedNote.style.backgroundColor = note.color;
});
hubConnection.on('UpdateSize', function (note) {
    updtedNote = document.getElementById(note.id);
    updtedNote.style.width = note.width + 'px';
    updtedNote.style.height = note.height + 'px';
});
hubConnection.on('UpdatePosition', function (note) {
    updtedNote = document.getElementById(note.id);
    updtedNote.style.top = note.top + 'px';
    updtedNote.style.left = note.left + 'px';
});
hubConnection.on('CloseNote', function (id) {
    note = document.getElementById(id);
    mainContainer = document.getElementById('content');
    mainContainer.removeChild(note)
});
hubConnection.start();

document.getElementById('content').addEventListener('mousedown', {
    handleEvent(event) {
        if (event.target.id === 'content') {
            ToEdit(null, event.clientX, event.clientY);
        }
    }
})
document.body.addEventListener('mousemove', e => {
    if (changeSize) {
        width = changedItem.style.width
        height = changedItem.style.height
        if (parseInt(width.substr(0, width.length - 2)) > 200 || (e.clientX - curX) > 0) {
            changedItem.style.width = (parseInt(width.substr(0, width.length - 2)) +
                (e.clientX - curX)) + 'px';
            curX = e.clientX
        }
        if (parseInt(height.substr(0, height.length - 2)) > 120 || (e.clientY - curY) > 0) {
            changedItem.style.height = (parseInt(height.substr(0, height.length - 2)) +
                (e.clientY - curY)) + 'px';
            curY = e.clientY
        }
        hubConnection.invoke('UpdateSize',
            parseInt(changedItem.style.width.substr(0, changedItem.style.width.length - 2)),
            parseInt(changedItem.style.height.substr(0, changedItem.style.height.length - 2)),
            changedItem.id)
    }
    else {
        if (changePosition) {
            toper = changedItem.style.top
            lefter = changedItem.style.left
            changedItem.style.top = (parseInt(toper.substr(0, toper.length - 2)) +
                (e.clientY - curY)) + 'px';
            curY = e.clientY
            changedItem.style.left = (parseInt(lefter.substr(0, lefter.length - 2)) +
                (e.clientX - curX)) + 'px';
            curX = e.clientX
            hubConnection.invoke('UpdatePosition',
                parseInt(changedItem.style.top.substr(0, changedItem.style.top.length - 2)),
                parseInt(changedItem.style.left.substr(0, changedItem.style.left.length - 2)),
                changedItem.id)
        }
    }

});
document.body.addEventListener('mouseup', e => {
    changeSize = false;
    changePosition = false;
    changedItem = null;
    curX = null;
    curY = null;
})
function createNote(note) {
    newNote = document.createElement('div');
    newNote.classList.add('sticker');
    newNote.classList.add('p-0');
    newNote.classList.add('m-3');
    newNote.style.width = note.width + 'px';
    newNote.style.height = note.height + 'px';
    newNote.style.top = note.top + 'px';
    newNote.style.left = note.left + 'px';
    newNote.id = note.id;
    newNote.style.backgroundColor = note.color
    panel = CreatePanel(note);
    text = document.createElement('p');
    text.id = note.id + 'text'
    text.classList.add('ml-3');
    text.classList.add('mr-3');
    text.classList.add('mb-3');
    text.innerHTML = markdown.toHTML(note.text);
    downPanel = CreateDownPanel(note)
    text.onmousedown = function (event) {
            ToEdit(note.id, null, null)
    }
    newNote.appendChild(panel);
    newNote.appendChild(text)
    downPanel.appendChild(expand);
    newNote.appendChild(downPanel);

    return newNote;
}
function CreateDownPanel (note){
    downPanel = document.createElement('div');
    downPanel.classList.add('down-panel');
    expand = document.createElement('div');
    expand.classList.add('expand');
    expand.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true"></i>'
    expand.onmousedown = function (e) {
        changeSize = true;
        changedItem = document.getElementById(note.id);
        curX = e.clientX;
        curY = e.clientY;
    }
    expand.onmouseup = function (e) {
        changeSize = false;
        changedItem = null;
    }
    return downPanel;
}
function CreatePanel(note) {
    panel = document.createElement('div');
    panel.classList.add('panel');
    pink = document.createElement('div');
    pink.classList.add('pink-circ');
    pink.innerHTML = '<i class="fa fa-circle fa-lg"></i>'
    pink.onmousedown = function () {
        ChangeColor('violet', note.id)
    }
    yellow = document.createElement('div');
    yellow.classList.add('yellow-circ');
    yellow.innerHTML = '<i class="fa fa-circle fa-lg"></i>'
    yellow.onmousedown = function () {
        ChangeColor('yellow', note.id)
    }
    blue = document.createElement('div');
    blue.classList.add('blue-circ');
    blue.innerHTML = '<i class="fa fa-circle fa-lg"></i>'
    blue.onmousedown = function () {
        ChangeColor('deepskyblue', note.id)
    }
    closeIcon = document.createElement('div')
    closeIcon.classList.add('close-icon');
    closeIcon.innerHTML = '<i class="fa fa-times fa-lg"></i>'
    closeIcon.onmousedown = function () {
        CloseNote(note.id)
    }
    panel.appendChild(pink)
    panel.appendChild(yellow)
    panel.appendChild(blue)
    panel.appendChild(closeIcon)
    panel.id = 'panel'
    panel.onmousedown = function (e) {
        if (e.target.id === 'panel') {
            changePosition = true;
            changedItem = document.getElementById(note.id);
            curX = e.clientX;
            curY = e.clientY;
        }
    }
    panel.onmouseup = function (e) {
        if (e.target.id === 'panel') {
            changePosition = false;
            changedItem = null;
        }
    }
    return panel;
}
async function ToEdit(id, x, y) {
    fade = document.getElementById('fade');
    area = document.getElementById('edit-input');
    fade.style.display = 'block';
    editor = document.getElementById('editor');
    editor.style.display = 'block';
    area.style.backgroundColor = 'yellow'
    editor.style.backgroundColor = 'yellow'
    
    if (id !== null) {
        note = document.getElementById(id);
        note.style.display = 'none';
        area.value = await hubConnection.invoke('GetText', id);
        editor.style.backgroundColor = document.getElementById(id).style.backgroundColor;
        area.style.backgroundColor = document.getElementById(id).style.backgroundColor;
    }
    fade.onmousedown = function () {
        ToWatch(id, x, y)
    }
}
function ToWatch(id, x, y) {
    hubConnection.invoke('UpdateText', document.getElementById('edit-input').value, id, x, y)
    if (id !== null) {
        div = document.getElementById(id);
        div.style.display = 'flex';
        div.children[1].innerHTML = markdown.toHTML(document.getElementById('edit-input').value)
    }
    area = document.getElementById('edit-input');
    area.value = '';
    fade = document.getElementById('fade');
    editor = document.getElementById('editor');
    editor.style.display = 'none';
    fade.style.display = 'none';
}
function ChangeColor(color, id) {
    hubConnection.invoke('UpdateColor', color, id)
}

function CloseNote(id) {
    hubConnection.invoke('CloseNote', id);
}