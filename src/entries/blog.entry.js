// blog surface entry — wires public-softcode loader
window.GG = window.GG || {};
window.GG.entries = window.GG.entries || {};
window.GG.entries["blog"] = { id: "blog", loaded: true };
if (window.GG.publicSoftcodeInit) {
  window.GG.publicSoftcodeInit("blog");
}