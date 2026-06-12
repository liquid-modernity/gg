// landing surface entry — wires public-softcode loader
window.GG = window.GG || {};
window.GG.entries = window.GG.entries || {};
window.GG.entries["landing"] = { id: "landing", loaded: true };
if (window.GG.publicSoftcodeInit) {
  window.GG.publicSoftcodeInit("landing");
}