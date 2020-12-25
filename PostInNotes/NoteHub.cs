using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Toolkit.Parsers.Markdown;

namespace PostInNotes
{
    public interface IPostClient
    {
        Task RenderNotes(NoteOptions[] notes);
        Task AddNote(NoteOptions note);
        Task UpdateText(NoteOptions note);
        Task UpdateColor(NoteOptions note);
        Task UpdateSize(NoteOptions note);
        Task UpdatePosition(NoteOptions note);
        Task CloseNote(string id);
    }
    public class NoteHub: Hub<IPostClient>
    {
        private INotesRepository repository;
        Random random;
        public NoteHub(INotesRepository repository)
        {
            this.repository = repository;
            random = new Random();
        }
        public async Task UpdateText(string innerText, string id, int? x, int? y)
        {
            if (id is null)
            {
                repository.Notes.Add(new NoteOptions() {
                    text = innerText, 
                    top = y.GetValueOrDefault(), 
                    left = x.GetValueOrDefault() });
                await Clients.All
                .AddNote(repository.Notes.Last());
            }
            else {
                NoteOptions updatedNote = repository.Notes.Find(note => note.id == id);
                updatedNote.text = innerText;
                await Clients.All
                .UpdateText(updatedNote);
            }
        }
        public async Task<string> GetText(string id) {
            NoteOptions updatedNote = repository.Notes.Find(note => note.id == id);
            return updatedNote.text;
        }
        public async Task CloseNote(string id)
        {
            repository.Notes.Remove(repository.Notes.Find(note => note.id == id));
                await Clients.All
                .CloseNote(id);
        }
        public async Task UpdateColor(string color, string id)
        {

            NoteOptions updatedNote = repository.Notes.Find(note => note.id == id);
            updatedNote.color = color;
            await Clients.All
            .UpdateColor(updatedNote);
        }
        public async Task UpdateSize(int width, int height, string id)
        {

            NoteOptions updatedNote = repository.Notes.Find(note => note.id == id);
            updatedNote.width = width;
            updatedNote.height = height;
            await Clients.AllExcept(Context.ConnectionId)
            .UpdateSize(updatedNote);
        }
        public async Task UpdatePosition(int top, int left, string id)
        {

            NoteOptions updatedNote = repository.Notes.Find(note => note.id == id);
            updatedNote.top = top;
            updatedNote.left = left;
            await Clients.AllExcept(Context.ConnectionId)
            .UpdatePosition(updatedNote);
        }
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            await Clients.Client(Context.ConnectionId)
                .RenderNotes(repository.Notes.ToArray());
        }
    }
}
