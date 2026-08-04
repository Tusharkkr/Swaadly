import axios from 'axios';
import React, { useCallback, useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext';
import './Verify.css'

const Verify = () => {
  const { url } = useContext(StoreContext)
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success")
  const orderId = searchParams.get("orderId")
  const sessionId = searchParams.get("session_id")

  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    try {
      const response = await axios.post(url + "/api/order/verify", { success, orderId, sessionId });
      navigate(response.data.success ? "/myorders" : "/");
    } catch {
      navigate("/");
    }
  }, [navigate, orderId, sessionId, success, url])

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment])

  return (
    <div className='verify'>
      <div className="spinner"></div>
    </div>
  )
}

export default Verify