"use client";
import { Listbox } from "@headlessui/react";
import { GoTriangleDown } from "react-icons/go";
import { FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import React, { useState, useCallback } from "react";
import { sitePlaceholder, sites, siteImg, siteRegex } from "@/modules/other/compSitesConstants";
import { ProblemObject, SiteNameType } from "@/types/DBTypes";
import { CompSitesListboxProps } from "@/types/compSitesListboxProps";

const CompSitesListbox: React.FC<CompSitesListboxProps> = ({ id, defaultProblem, gotTitle, handleSetProblem, handleDeleteInput }) => {
  const [problemData, setProblemData] = useState<ProblemObject>({ site: defaultProblem[0], value: defaultProblem[1], isInputValid: false });

  const handleChange = useCallback(
    (site: SiteNameType) => {
      setProblemData((prev) => ({ site, value: prev.value, isInputValid: siteRegex[site].test(prev.value) }));
      handleSetProblem(id, site, problemData.value, siteRegex[site].test(problemData.value));
    },
    [id, problemData.value, handleSetProblem]
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setProblemData((prev) => ({ site: prev.site, value, isInputValid: siteRegex[prev.site].test(value) }));
      handleSetProblem(id, problemData.site, value, siteRegex[problemData.site].test(value));
    },
    [id, problemData.site, handleSetProblem]
  );

  return (
    <div className="my-1 flex">
      <Listbox value={problemData.site} onChange={handleChange}>
        <Listbox.Button className="flex font-bold relative rounded-lg bg-violet-200 py-1.5 pr-3 pl-3 text-left text-sm/6 text-gray-800 focus:outline-none">
          <img width={20} className="my-auto mr-2" src={siteImg[problemData.site]} alt="" />
          <span className="my-auto">{problemData.site}</span>
          <GoTriangleDown className="my-auto ml-2" />
        </Listbox.Button>
        <Listbox.Options className="z-10 absolute w-[var(--button-width)] mt-12 rounded-xl border border-white bg-white p-1">
          {sites.map((site) => (
            <Listbox.Option key={site.name} value={site.name} className="hover:bg-gray-100 group cursor-default items-center gap-2 rounded-lg py-1.5 transition px-3 select-none">
              <div className="flex border-b border-black">
                <img width={20} className="my-auto mr-2" src={siteImg[site.name]} alt="" />
                <div className="text-sm/6 text-gray-800 cursor-pointer font-semibold my-auto">{site.name}</div>
              </div>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Listbox>
      <input
        name={id}
        placeholder={sitePlaceholder[problemData.site]}
        maxLength={50}
        onChange={handleValueChange}
        value={problemData.value}
        className="w-96 ml-5 rounded border bg-gray-50 px-3 py-2 text-gray-800 outline-none ring-indigo-300 transition duration-100 focus:ring"
      />
      <div className={`flex justify-center transition h-full w-10 ml-5 rounded ${gotTitle === "got" ? "bg-green-400" : gotTitle === "notGot" ? "bg-red-400" : "bg-gray-400"}`}>
        {gotTitle === "got" ? <FaCheck className="text-2xl my-auto text-white" /> : gotTitle === "notGot" ? <FaTimes className="text-2xl my-auto text-white" /> : <></>}
      </div>
      <button onClick={() => handleDeleteInput(id)} className="bg-red-600 flex justify-center hover:bg-red-700 transition h-full w-10 ml-5 rounded">
        <FaTrash className="text-2xl my-auto text-white" />
      </button>
    </div>
  );
};

export default React.memo(CompSitesListbox);
