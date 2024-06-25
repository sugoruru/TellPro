"use client";
import returnRandomString from "@/modules/algo/returnRandomString";
import { UserPublic } from "@/types/user";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const Reports = () => {
  const [user, setUser] = useState(null as UserPublic | null);
  const [reports, setReports] = useState([] as Report[]);

  useEffect(() => {
    const fetcher = async () => {
      const data = await axios.get(`/api/db/users/existMe`);
      setUser(data.data.data);
      if (data.data.data.is_admin) {
        const reports = await axios.post(`/api/admin/get_report`);
        setReports(reports.data.data);
      }
    };
    fetcher();
  }, []);

  return (
    <div>
      {!user ? (
        <>ロード中</>
      ) : user.is_admin ? (
        <>
          <div className="flex justify-center">
            <table>
              <thead>
                <tr>
                  <th>user_id</th>
                  <th>reported_user_id</th>
                  <th>report_value</th>
                  <th>created_at</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={returnRandomString(64)}>
                    <th>
                      <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href={`/${report.user_id}`}>
                        {report.user_id}
                      </Link>
                    </th>
                    <td>
                      <Link className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600" href={`/${report.reported_user_id}`}>
                        {report.reported_user_id}
                      </Link>
                    </td>
                    <td>{report.report_value}</td>
                    <td>{report.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>Admin以外は閲覧できません</>
      )}
    </div>
  );
};

export default Reports;
