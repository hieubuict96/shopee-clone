import axiosInstance from '../common-middleware/axiosInstance';
import { SIGNED_OUT } from '../const/userConstant';

export const getOrderListAction = (sellerId, setListOrder) => async (dispatch) => {
  try {
    const response = await axiosInstance.get("/api/order/get-list-order", {
      params: {
       sellerId
      }
    });

    console.log(response.data.productsOrder);
    setListOrder({
      isGet: true,
      productsOrder: response.data.productsOrder
    });
  } catch (error) {
    if (error.response.data.error === "verifyFail") {
      return dispatch({ type: SIGNED_OUT });
    }

    alert("Đã xảy ra lỗi phía máy chủ, vui lòng thử lại sau")

  }
}