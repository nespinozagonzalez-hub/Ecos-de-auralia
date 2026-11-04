// Original synthesized ambience. No external tracks, downloads or samples.
export class AuraliaAudio {
  constructor(){this.context=null;this.master=null;this.enabled=false;this.next=0;this.step=0;}
  async setEnabled(on){
    if(on){
      const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return false;
      try{this.context??=new AudioContext();if(!this.master){this.master=this.context.createGain();this.master.gain.value=.16;this.master.connect(this.context.destination);}await this.context.resume();this.enabled=true;this.next=0;}catch{return false;}
    }else{this.enabled=false;if(this.context)await this.context.suspend();}
    return this.enabled;
  }
  tone(frequency,duration=.45,level=.15,type='sine',delay=0){
    if(!this.enabled||!this.context)return;
    const time=this.context.currentTime+delay,osc=this.context.createOscillator(),gain=this.context.createGain();osc.type=type;osc.frequency.value=frequency;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(level,time+.015);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);osc.connect(gain);gain.connect(this.master);osc.start(time);osc.stop(time+duration+.05);
  }
  chime(kind='success'){
    const seq=kind==='success'?[392,493.88,587.33]:kind==='relic'?[293.66,392,493.88,783.99]:kind==='hit'?[120,75]:[329.63];seq.forEach((f,i)=>this.tone(f,kind==='hit'?.15:1,.22,'sine',i*.12));
  }
  update(scene,now,paused){
    if(!this.enabled||paused||now<this.next)return;
    this.next=now+4.5;const roots=scene==='sanctuary'?[146.83,174.61,220,196]:scene==='forest'?[196,220,261.63,293.66]:[196,246.94,293.66,220],root=roots[this.step++%roots.length];
    this.tone(root,5,.13);this.tone(root*1.5,4.8,.07,'sine',.2);this.tone(root*2,2.8,.065,'sine',1.1);this.tone(root*3,2,.025,'sine',2.4);
  }
}
