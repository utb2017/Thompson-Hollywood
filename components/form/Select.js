//     <!--
//     Tailwind UI components require Tailwind CSS v1.8 and the @tailwindcss/ui plugin.
//     Read the documentation to get started: https://tailwindui.com/documentation
//   -->
//   <!--
//     Custom select controls like this require a considerable amount of JS to implement from scratch. We're planning
//     to build some low-level libraries to make this easier with popular frameworks like React, Vue, and even Alpine.js
//     in the near future, but in the mean time we recommend these reference guides when building your implementation:

//     https://www.w3.org/TR/wai-aria-practices/#Listbox
//     https://www.w3.org/TR/wai-aria-practices/examples/listbox/listbox-collapsible.html
//   -->

export default function Select({
    children,
    
}) {
    return (
      <div className='space-y-1'>
        <label
          id='listbox-label'
          className='block text-sm leading-5 font-medium text-gray-700'>
          Assigned to
        </label>
        <div className='relative'>
          <span className='inline-block w-full rounded-md shadow-sm'>
            <button
              type='button'
              aria-haspopup='listbox'
              aria-expanded='true'
              aria-labelledby='listbox-label'
              className='cursor-default relative w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 py-2 text-left focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition ease-in-out duration-150 sm:text-sm sm:leading-5'>
              <div className='flex items-center space-x-3'>
                <img
                  src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                  alt
                  className='flex-shrink-0 h-6 w-6 rounded-full'
                />
                <span className='block truncate'>Tom Cook</span>
              </div>
              <span className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400'
                  viewBox='0 0 20 20'
                  fill='none'
                  stroke='currentColor'>
                  <path
                    d='M7 7l3-3 3 3m0 6l-3 3-3-3'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </span>
            </button>
          </span>
          {/*
          Select popover, show/hide based on select state.
    
          Entering: ""
            From: ""
            To: ""
          Leaving: "transition ease-in duration-100"
            From: "opacity-100"
            To: "opacity-0"
        */}
          <div className='absolute mt-1 w-full rounded-md bg-white shadow-lg'>
            <ul
              tabIndex={-1}
              role='listbox'
              aria-labelledby='listbox-label'
              aria-activedescendant='listbox-item-3'
              className='max-h-56 rounded-md py-1 text-base leading-6 shadow-xs overflow-auto focus:outline-none sm:text-sm sm:leading-5'>
              {/*
              Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.
    
              Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
            */}
  
              {[0, 1, 2, 4].map((i) => {
                return (
                  <li
                    id='listbox-item-0'
                    role='option'
                    className='text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9'>
                    <div className='flex items-center space-x-3'>
                      <img
                        src='https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                        alt
                        className='flex-shrink-0 h-6 w-6 rounded-full'
                      />
                      {/* Selected: "font-semibold", Not Selected: "font-normal" */}
                      <span className='font-normal block truncate'>
                        Wade Cooper
                      </span>
                    </div>
                    {/*
                Checkmark, only display for selected option.
    
                Highlighted: "text-white", Not Highlighted: "text-indigo-600"
              */}
                    <span className='absolute inset-y-0 right-0 flex items-center pr-4'>
                      {/* Heroicon name: check */}
                      <svg
                        className='h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'>
                        <path
                          fillRule='evenodd'
                          d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  }
  