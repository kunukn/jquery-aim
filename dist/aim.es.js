function e(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var t=function(e){return[].slice.call(document.querySelectorAll(e),0)},n=function(){return(Math.random()+"").substr(2)};function i(i){var a=i.target,c=function(t){for(var n=1;n<arguments.length;n++){var i=null!=arguments[n]?arguments[n]:{},r=Object.keys(i);"function"==typeof Object.getOwnPropertySymbols&&(r=r.concat(Object.getOwnPropertySymbols(i).filter(function(e){return Object.getOwnPropertyDescriptor(i,e).enumerable}))),r.forEach(function(n){e(t,n,i[n])})}return t}({},i);if(delete c.target,"string"==typeof a){var o=t(a);if(o&&o.length){var u=[];return o.forEach(function(e){var t=n();r.push({id:t,target:e,data:y(e),options:c}),u.push(t)}),1===o.length?u[0]:u}}var f=n();return r.push({id:f,target:a,data:y(a),options:c}),f}var r=[],a=function(e,t,n){return Math.min(Math.max(e,t),n)},c=function(e){var t=e.x,n=e.y;return Math.sqrt(t*t+n*n)},o=function(e){var t=e.size;return{size:t,center:{x:0,y:0},effectiveSize:1,rect:{x0:0,y0:0,x1:t,y1:t}}},u={x:0,y:0},f=c(u),l={x:0,y:0},s=0,m=0,d=!1,v=o({size:50});i.setDebug=function(e){var t,n,i=document.getElementById("#__aim-debug");if(e){if(i)return;v.element=(t=v.size,(n=document.createElement("div")).setAttribute("id","__aim-debug"),n.style.width=2*t+"px",n.style.height=2*t+"px",n.style["margin-left"]=-t+"px",n.style["margin-top"]=-t+"px",document.body.appendChild(n),n)}else v.element=null,i&&i.remove();d=e},i.setAnticipator=function(e){var t=e.size;v=o({size:t})};var y=function(e){var t=null;e instanceof HTMLElement&&(t=e.getBoundingClientRect());var n=t||e,i=n.x,r=n.y,a=n.width,c=n.height;return"100%"===a&&(i=0,a=window.innerWidth),"100%"===c&&(r=0,c=window.innerHeight),{rect:{x0:i,y0:r,x1:i+a,y1:r+c},center:{x:i,y:r},increment:0}};var x=function(e){var t,n,i,r=e.item,a=e.intersectRatioValue;return{angle:(t=u,n=t.x,i=t.y,180*Math.atan2(i,n)/Math.PI),velocity:u,magnitude:f,intersectRatioValue:a||0,rect:r.data.rect,id:r.id,target:r.target}},h=function(){var e=v;r.length&&(!function(e){var t=e.position,n=e.velocity,i=e.pointerX,r=e.pointerY,o=e.anticipator;t.x&&t.y&&(n.x=.7*n.x+.3*(i-t.x),n.y=.7*n.y+.3*(r-t.y)),t.x=i,t.y=r,(f=c(n))<.1&&(n.x=0,n.y=0),o.effectiveSize=Math.sqrt(o.size*f+1),o.center.x=.7*o.center.x+.3*(t.x+12*n.x);var u=window.innerWidth,l=window.innerHeigh;a(o.center.x,0,u-o.effectiveSize),o.rect.x0=o.center.x-o.effectiveSize,o.rect.x1=o.center.x+o.effectiveSize,o.center.y=.7*o.center.y+.3*(t.y+12*n.y),a(o.center.y,0,l-o.effectiveSize),o.rect.y0=o.center.y-o.effectiveSize,o.rect.y1=o.center.y+o.effectiveSize}({position:l,velocity:u,pointerX:s,pointerY:m,anticipator:v}),d&&(e.element.style.transform="translate(".concat(e.center.x,"px, ").concat(e.center.y,"px) scale(").concat(e.effectiveSize/e.size,")")),r.forEach(function(t){var n,i,r=t.target,a=t.data,c=t.options,o=(n=a.rect,i=e.rect,Math.max(0,Math.min(n.x1,i.x1)-Math.max(n.x0,i.x0))*Math.max(0,Math.min(n.y1,i.y1)-Math.max(n.y0,i.y0))/(v.effectiveSize*v.effectiveSize));if(o&&0!==f)return a.increment+=.2*o,void(1<a.increment&&a.increment<2?(c.className&&r instanceof HTMLElement&&r.classList.add(c.className),"function"==typeof c.aimEnter&&c.aimEnter.call(r,x({item:t,intersectRatioValue:o})),d&&e.element.classList.add("__aim-debug--hit")):a.increment>2&&(a.increment=2,d&&e.element.classList.add("__aim-debug--hit-2")));d&&setTimeout(function(){e.element.classList.remove("__aim-debug--hit"),e.element.classList.remove("__aim-debug--hit-2")},0),0!==a.increment&&0===o&&(a.increment-=.05,a.increment<0&&(a.increment=0,c.className&&r instanceof HTMLElement&&r.classList.remove(c.className),"function"==typeof c.aimExit&&c.aimExit.call(r,x({item:t}))))}))},g=!0,p=function(e){s=e.clientX,m=e.clientY},b=!1;i.start=function(){b||(b=!0,document.addEventListener("mousemove",p),g=!0,function e(){h(),g&&requestAnimationFrame(e)}())},i.stop=function(){b&&(b=!1,g=!1,document.removeEventListener("mousemove",p))},i.removeAll=function(){r=[]},i.remove=function(e){if(!e)return!1;var t=!1;return e.id?r.forEach(function(n){n.id===e.id&&(n=null,t=!0)}):r.forEach(function(n){n.target===e&&(n=null,t=!0)}),t&&(r=r.filter(Boolean)),t},i.updatePosition=function(e){if(!e)return!1;var t=!1;return"dom"===e?r.forEach(function(e){e.target instanceof HTMLElement&&(e.data=y(e.target),t=!0)}):e.id?r.forEach(function(n){if(n.id===e.id)return n.data=y(e),void(t=!0)}):r.forEach(function(n){if(n.target===e)return n.data=y(e),void(t=!0)}),t};export default i;
//# sourceMappingURL=aim.es.js.map
