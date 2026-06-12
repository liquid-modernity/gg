// store surface entry — wires public-softcode loader
window.GG = window.GG || {};
window.GG.entries = window.GG.entries || {};
window.GG.entries["store"] = { id: "store", loaded: true };
if (window.GG.publicSoftcodeInit) {
  window.GG.publicSoftcodeInit("store");
}