import { redirect, RedirectType } from 'next/navigation'
import React from 'react'

const page = () => {
  return redirect('/workspace/dashboard', RedirectType.replace)
}

export default page