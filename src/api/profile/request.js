import axios from "api/axios";

export const getProfileAPI = async () => {
  return await axios({
    url: "/profile",
    method: "GET",
  });
};

export const updateProfileAPI = async (data) => {
  return await axios({
    url: "/profile",
    method: "PUT",
    data,
  });
};

export const uploadProfileAvatarAPI = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return await axios({
    url: "/profile/avatar",
    method: "POST",
    data: formData,
  });
};

export const updateProfilePasswordAPI = async (data) => {
  return await axios({
    url: "/profile/change-password",
    method: "POST",
    data,
  });
};

export const getAddressesAPI = async () => {
  return await axios({
    url: "/addresses",
    method: "GET",
  });
};

export const createAddressAPI = async (data) => {
  return await axios({
    url: "/addresses",
    method: "POST",
    data,
  });
};

export const updateAddressAPI = async (id, data) => {
  return await axios({
    url: `/addresses/${id}`,
    method: "PUT",
    data,
  });
};

export const deleteAddressAPI = async (id) => {
  return await axios({
    url: `/addresses/${id}`,
    method: "DELETE",
  });
};

export const setDefaultAddressAPI = async (id) => {
  return await axios({
    url: `/addresses/${id}/set-default`,
    method: "PATCH",
  });
};
