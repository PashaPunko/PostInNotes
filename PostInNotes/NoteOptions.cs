using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
namespace PostInNotes
{
    public class NoteOptions
    {
        public NoteOptions(){
            id = Guid.NewGuid().ToString();
            color = "yellow";
            width = 250;
            height = 250;
        }
        public string text { get; set;}
        public string id { get; set;}
        public string color { get; set;}
        public int width { get; set;}
        public int height { get; set;}
        public int top { get; set; }
        public int left { get; set; }
    }
}
