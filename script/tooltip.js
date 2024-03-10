/*
const button = document.querySelector('#button');
const tooltip = document.querySelector('#tooltip');

const popperInstance = Popper.createPopper(button, tooltip, {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 8],
      },
    },
  ],
});

function show() {
  // Make the tooltip visible
  tooltip.setAttribute('data-show', '');

  // Enable the event listeners
  popperInstance.setOptions((options) => ({
    ...options,
    modifiers: [
      ...options.modifiers,
      { name: 'eventListeners', enabled: true },
    ],
  }));

  // Update its position
  popperInstance.update();
}

function hide() {
  // Hide the tooltip
  tooltip.removeAttribute('data-show');

  // Disable the event listeners
  popperInstance.setOptions((options) => ({
    ...options,
    modifiers: [
      ...options.modifiers,
      { name: 'eventListeners', enabled: false },
    ],
  }));
}

const showEvents = ['mouseenter', 'focus'];
const hideEvents = ['mouseleave', 'blur'];

showEvents.forEach((event) => {
  button.addEventListener(event, show);
});

hideEvents.forEach((event) => {
  button.addEventListener(event, hide);
});
*/

/* let popperInstance = null

function setTooltipListeners(){
  const tooltipItems = document.querySelectorAll("#map g#features > g")
  const tooltip = document.querySelector('#tooltip');
  const tooltipContent = document.querySelector('#tooltipcontent');
  
  tooltipItems.forEach(item => {
    item.addEventListener('mouseenter', function(event){
      let ddd = [
        {name: 'chp', value: 12, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Cumhuriyet_Halk_Partisi_Logo.svg/160px-Cumhuriyet_Halk_Partisi_Logo.svg.png'},
        {name: 'akp', value: 45, url: 'https://upload.wikimedia.org/wikipedia/tr/thumb/d/d5/Adalet_ve_Kalk%C4%B1nma_Partisi_logo.png/160px-Adalet_ve_Kalk%C4%B1nma_Partisi_logo.png'},
        {name: 'mhp', value: 67, url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Milliyet%C3%A7i_Hareket_Partisi_Logo.svg/160px-Milliyet%C3%A7i_Hareket_Partisi_Logo.svg.png'},
    ]
      let itemId = event.target.getAttribute('id');
      tooltipContent.replaceChildren();
      tooltipContent.insertAdjacentHTML('afterbegin', `<ul> ${ddd.map(elem => `<li> <span>${elem.name}</span> <img src="${elem.url}" style="height: 20px;"> <span>%${elem.value}</span> </li>`).join('\n')}</ul>`)
      popperInstance = Popper.createPopper(event.target, tooltip, {
        modifiers:[
          {
            name: 'offset',
            options: {offset: [0,5]}
          }
        ]
      });
      tooltip.setAttribute('data-show', '')
    })
    //item.addEventListener('focus', show(item))
    item.addEventListener('mouseleave', function(){
      tooltip.removeAttribute('data-show')
      popperInstance.destroy()
    })
    //item.addEventListener('blur', hide)
  })
} */