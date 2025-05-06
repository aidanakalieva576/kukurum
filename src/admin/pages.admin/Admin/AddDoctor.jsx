import React, { useState } from "react";
import { assets } from "../../assets.admin/assets_admin/assetsadmin";
import { toast } from "react-toastify";
import { useContext } from "react";
import { UnifiedContext } from "../../../context/UnifiedContext";
import translations from "../../../utils";

const AddDoctor = () => {
  const { language } = useContext(UnifiedContext);
  const t = translations[language];
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    experience: "1 year",
    fees: "",
    speciality: "General physician",
    degree: "",
    address1: "",
    address2: "",
    about: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name || !form.email || !form.password ||
      !form.fees || !form.degree || !form.address1 ||
      !form.address2 || !form.about || !image
    ) {
      setError(t.error_fill_all_fields);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("experience", form.experience);
    formData.append("fees", form.fees);
    formData.append("speciality", form.speciality);
    formData.append("degree", form.degree);
    formData.append("address", JSON.stringify({
      line1: form.address1,
      line2: form.address2
    }));
    formData.append("about", form.about);
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:8000/admin/add_doctor", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t.error_adding_doctor);

      toast(t.success_doctor_added);
      setForm({
        name: "", email: "", password: "", experience: "1 year", fees: "",
        speciality: "General physician", degree: "", address1: "", address2: "", about: ""
      });
      setImage(null);
      setPreview(null);
      setError("");
    } catch (err) {
      setError(err.message || t.error_generic);
    }
  };

  return (
    <form className="m-5 w-full" onSubmit={handleSubmit}>
      <p className="mb-3 text-lg font-medium">{t.add_doctor}</p>

      <div className="bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80-vh] overflow-scroll">
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex items-center gap-4 mb-8 text-gray-500">
          <label htmlFor="doc-img">
            <img
              className="w-16 bg-gray-100 rounded-full cursor-pointer"
              src={preview || assets.upload_area}
              alt=""
            />
          </label>
          <input type="file" id="doc-img" hidden onChange={handleImageChange} />
          <p>{t.upload_image}</p>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10 text-gray-600">
          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>{t.doctor_name}</p>
              <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t.name} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary" />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>{t.doctor_email}</p>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t.email} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary" />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>{t.doctor_password}</p>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder={t.password} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary" />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>{t.experience}</p>
              <select name="experience" value={form.experience} onChange={handleChange}>
                {[...Array(20).keys()].map((i) => (
                  <option key={i + 1} value={`${i + 1} year`}>
                    {i + 1} {t.year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>{t.fees}</p>
              <input type="number" name="fees" value={form.fees} onChange={handleChange} placeholder={t.fees} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div className="w-full lg:flex-1 flex flex-col gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <p>{t.speciality}</p>
              <select name="speciality" value={form.speciality} onChange={handleChange}>
                <option value="General physician">{t.specialist_gp}</option>
                <option value="Gynecologist">{t.specialist_gynecologist}</option>
                <option value="Dermatologist">{t.specialist_dermatologist}</option>
                <option value="Pedeatrians">{t.specialist_pediatrician}</option>
                <option value="Neurologist">{t.specialist_neurologist}</option>
                <option value="Gastroenterologist">{t.specialist_gastroenterologist}</option>
              </select>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>{t.degree}</p>
              <input type="text" name="degree" value={form.degree} onChange={handleChange} placeholder={t.degree} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary" />
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <p>{t.address}</p>
              <input type="text" name="address1" value={form.address1} onChange={handleChange} placeholder={t.address1} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary" />
              <input type="text" name="address2" value={form.address2} onChange={handleChange} placeholder={t.address2} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary mt-2" />
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <p className="mt-4 mb-2">{t.about}</p>
          <textarea name="about" value={form.about} onChange={handleChange} placeholder={t.about_placeholder} rows={5} required className="w-full rounded border px-3 py-2 focus:outline-none focus:border-primary" />
        </div>

        <button type="submit" className="bg-primary px-10 py-3 mt-4 text-white rounded-full">
          {t.submit_add_doctor}
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
