using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PostInNotes
{
    public interface INotesRepository
    {
        List<NoteOptions> Notes { get; }
    }

    public class NoteRepository : INotesRepository
    {
        public NoteRepository()
        {
        }
        public List<NoteOptions> Notes { get; } = new List<NoteOptions>();
    }
}
